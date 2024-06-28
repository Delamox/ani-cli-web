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

#[post("/search", data = "<data>")]
async fn search(data: Data<'_>) -> content::RawJson<String> {
    let stream = data
        .open(2.mebibytes())
        .into_string()
        .await
        .unwrap()
        .into_inner();
    let apiresponse = spawn_process(stream.as_str(), "", "");
    let list = generatevec(apiresponse.as_str());
    let json = serde_json::to_string(&list).unwrap();
    println!("\nsending anime list:\n{}\n", json);
    content::RawJson(json)
}

#[post("/episode", data = "<data>")]
async fn select_episode(data: Data<'_>) -> content::RawJson<String> {
    let stream = data
        .open(2.mebibytes())
        .into_string()
        .await
        .unwrap()
        .into_inner();
    let datavec: Vec<&str> = serde_json::from_str(stream.as_str()).unwrap();
    let apiresponse = spawn_process(datavec[0], datavec[1], "");
    let list = generatevec(apiresponse.as_str());
    let json = serde_json::to_string(&list).unwrap();
    println!("\nsending episode list\n{}\n", json);
    content::RawJson(json)
}

#[post("/link", data = "<data>")]
async fn get_link(data: Data<'_>) -> content::RawJson<String> {
    let stream = data
        .open(2.mebibytes())
        .into_string()
        .await
        .unwrap()
        .into_inner();
    let datavec: Vec<&str> = serde_json::from_str(stream.as_str()).unwrap();
    let apiresponse = spawn_process(datavec[0], datavec[1], datavec[2]);
    let ret = &apiresponse[5..].to_string();
    let json = serde_json::to_string(&ret).unwrap();
    println!("\nsending link:\n{}\n", json);
    content::RawJson(json)
}

fn generatevec(apiresponse: &str) -> Vec<&str> {
    let mut list: Vec<&str> = apiresponse.lines().collect();
    list.retain(|x| x.starts_with("acs: "));
    for i in list.iter_mut() {
        let ret: &str = &i[5..];
        *i = ret
    }
    list
}

fn spawn_process(query: &str, anime: &str, episode: &str) -> String {
    println!(
        "\nincoming POST:\nquery: {}\nanime: {}\nepisode: {}\n",
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
