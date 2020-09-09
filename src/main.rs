fn main() {
    println!("Hello, world!");
    for i in 1..11 {
        if i == 1 {
            println!("{} Rust server is better than express", i);
        } else {
            println!("{} Rust servers are better than express", i);
        }
    }
}
