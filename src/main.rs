use execute::Execute;
use rocket::data::{Data, ToByteUnit};
use rocket::fs::FileServer;
use rocket::response::content;
use std::env;
use std::process::{Command, Stdio};

#[macro_use]
extern crate rocket;

#[launch]
fn rocket() -> _ {
    let path = std::env::current_dir().unwrap().join("public");
    rocket::build()
        .mount("/", FileServer::from(path))
        .mount("/", routes![search, select_episode, get_link])
}
// #[get("/")]
// async fn index () -> NamedFile {
//     let path = std::env::current_dir().unwrap().join("index.html");
//     NamedFile::open(&path).await.unwrap()
// }
#[post("/search", data = "<data>")]
async fn search(data: Data<'_>) -> content::RawJson<String> {
    let stream = data.open(2.mebibytes()).into_string().await;
    let apiresponse = spawn_process(stream.unwrap().into_inner().as_str(), "", "");
    let mut list: Vec<&str> = apiresponse.lines().collect();
    list.retain(|x| x.starts_with("acs: "));
    for i in list.iter_mut() {
        let ret: &str = &i[5..];
        *i = ret
    }
    let json = serde_json::to_string(&list).unwrap();
    println!("sending anime list:\n{}", json);
    content::RawJson(json)
}

#[post("/episode", data = "<data>")]
async fn select_episode(data: Data<'_>) -> content::RawJson<String> {
    let stream = data.open(2.mebibytes()).into_string().await;
    let stream = stream.unwrap().clone().into_inner();
    let datavec: Vec<&str> = serde_json::from_str(stream.as_str()).unwrap();
    let apiresponse = spawn_process(datavec[0], datavec[1], "");
    let mut list: Vec<&str> = apiresponse.lines().collect();
    list.retain(|x| x.starts_with("acs: "));
    for i in list.iter_mut() {
        let ret: &str = &i[5..];
        *i = ret
    }
    let json = serde_json::to_string(&list).unwrap();
    println!("sending episode list\n{}", json);
    content::RawJson(json)
}

#[post("/link", data = "<data>")]
async fn get_link(data: Data<'_>) -> content::RawText<String> {
    let stream = data.open(2.mebibytes()).into_string().await;
    let stream = stream.unwrap().clone().into_inner();
    let datavec: Vec<&str> = serde_json::from_str(stream.as_str()).unwrap();
    let apiresponse = spawn_process(datavec[0], datavec[1], datavec[2]);
    let ret = &apiresponse[5..].to_string();
    println!("sending link:\n[{}]", ret);
    content::RawText(ret.to_owned())
}

fn spawn_process(query: &str, anime: &str, episode: &str) -> String {
    println!(
        "incoming POST:\nquery: {}\nanime: {}\nepisode: {}",
        query, anime, episode
    );
    let exec = env::current_dir().unwrap().join("ani.sh");
    let mut command = Command::new(exec);
    command.arg(query);
    if !anime.is_empty() {
        command.arg("-S");
        command.arg(anime);
    }
    if !episode.is_empty() {
        command.arg("-e");
        command.arg(episode);
    }
    command.stderr(Stdio::piped());
    let output = command.execute_output().unwrap();
    // for some reason it outputs to err lol
    String::from_utf8(output.stderr).unwrap()
}
