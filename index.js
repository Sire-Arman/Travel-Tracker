import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "First",
  password: "870742@aA",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");

  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  try {
    console.log(countries)
    res.render("index.ejs", { countries: countries, total: countries.length });
  } catch (error) {
    res.render("index.ejs", {  countries: countries, total: countries.length, error : error});
  }
});

// Adding countries
app.post("/add", async (req, res) => {
  const input = req.body["country"];
  try {
      const cc = await db.query(
      "SELECT country_code from countries where LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );
      const data = cc.rows[0];
      const code = data.country_code;
      try {
        console.log(code);
        await db.query(
        "insert into visited_countries (country_code) values($1)",
        [code]
      );
      res.redirect("/");
      } catch (error) {
        const countries = await checkVisisted();
        res.render("index.ejs",{countries: countries, total: countries.length,error:"Error: Country Already exists."});
      }
        
  } catch (error) {
    const countries = await checkVisisted();
    res.render("index.ejs",{countries: countries, total: countries.length,error:"Error: Country does not exist."});
  }
});
// app.post("/add", async (req, res) => {
//   const input = req.body["country"];

//   const result = await db.query(
//     "SELECT country_code FROM countries WHERE country_name = $1",
//     [input]
//   );

//   if (result.rows.length !== 0) {
//     const data = result.rows[0];
//     const countryCode = data.country_code;

//     await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [
//       countryCode,
//     ]);
//     res.redirect("/");
//   }
// });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
