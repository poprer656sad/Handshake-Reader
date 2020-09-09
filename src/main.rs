fn main() {
    println!("Hello, world!");
    print_more_stuff();
    for i in 1..11 {
        if i == 1 {
            println!("{} Rust server is better than express", i);
        } else {
            println!("{} Rust servers are better than express", i);
        }
    }
}

fn print_more_stuff() {
    println!("calling a function!");
}
