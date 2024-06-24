use execute::Execute;
use rocket::data::{Data, ToByteUnit};
use rocket::fs::FileServer;
use rocket::response::content;
use serde_json::Result;
use std::env;
use std::process::{Command, Stdio};

#[macro_use]
extern crate rocket;

#[launch]
fn rocket() -> _ {
    let path = std::env::current_dir().unwrap();
    rocket::build()
        .mount("/", FileServer::from(path))
        .mount("/", routes![search, select_episode])
}

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
    println!("{}", json);
    content::RawJson(json)
}

#[post("/episode", data = "<data>")]
async fn select_episode(data: Data<'_>) {
    let stream = data.open(2.mebibytes()).into_string().await;
    let stream = stream.unwrap().clone().into_inner();
    println!("{}", stream);
    let datavec: Vec<&str> = serde_json::from_str(stream.as_str()).unwrap();
    let apiresponse = spawn_process(datavec[0], datavec[1], "");
    println!("{}", apiresponse)
}

fn spawn_process(query: &str, anime: &str, episode: &str) -> String {
    println!("query >{}<", query);
    let exec = env::current_dir().unwrap().join("ani.sh");
    let mut command = Command::new(exec);
    let animefmt = if anime.is_empty() {
        "".to_string()
    } else { format!("-S {}", anime) };
    println!("q>{} {}", &query, &animefmt);
    command.arg(query).arg(animefmt);

    // let animefmt = format!("-S {}", anime);
    //
    // let argsvec: Vec<&str> = if !anime.is_empty() && !episode.is_empty() {
    //     //script return list of anime
    //     vec![query]
    // } else if !episode.is_empty() {
    //     //script return list of episode
    //     vec![query, &animefmt]
    // } else {
    //     //script return link
    //     vec![query, &animefmt, episode]
    // };
    command.stderr(Stdio::piped());
    let output = command.execute_output().unwrap();
    // for some reason it outputs to err lol
    String::from_utf8(output.stderr).unwrap()
}
