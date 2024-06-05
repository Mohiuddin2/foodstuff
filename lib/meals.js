import { S3 } from "@aws-sdk/client-s3";
import { Client } from "pg";
import slugify from "slugify";
import xss from "xss";

const s3 = new S3({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString,
});

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Connection error", err.stack));

export async function getMeals() {
  //   await new Promise((resolve) => setTimeout(resolve, 5000));
  const meals = await client.query("SELECT * FROM meals");
  // throw new Error('Loading meals failed');
  console.log("Get meals---------mm", meals.rows);
  return meals.rows;
}

// async function createTable() {
//   const res = await client.query(`SELECT * FROM meals`);
//   return console.log(
//     "Creating db----------------------------------------------------rr",
//     res.Result
//   );
// }
// createTable();
async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  const extension = meal.image.name.split(".").pop();
  const fileName = `${meal.slug}.${extension}`;
  const folderName = "images";
  const bufferedImage = await meal.image.arrayBuffer();

  try {
    await s3.putObject({
      Bucket: "mohiuddinextjs",
      Key: `${folderName}/${fileName}`,
      Body: Buffer.from(bufferedImage),
      ContentType: meal.image.type,
    });

    // meal.image = `https://mohiuddinextjs.s3.ap-south-1.amazonaws.com/${folderName}/${fileName}`;
    meal.image = `/${folderName}/${fileName}`;
    const query = `
      INSERT INTO meals
        (title, summary, instructions, creator, creator_email, image, slug)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const values = [
      meal.title,
      meal.summary,
      meal.instructions,
      meal.creator,
      meal.creator_email,
      meal.image,
      meal.slug,
    ];

    await client.query(query, values);
  } catch (error) {
    console.error("Error saving meal:", error);
    throw new Error("Failed to save meal");
  }
}

// -----------------------------------------------------------------------------------------
// const dummyMeals = [
//   {
//     title: "Juicy Cheese Burger",
//     slug: "juicy-cheese-burger",
//     image: "/images/burger.jpg",
//     summary:
//       "A mouth-watering burger with a juicy beef patty and melted cheese, served in a soft bun.",
//     instructions: `
//       1. Prepare the patty:
//          Mix 200g of ground beef with salt and pepper. Form into a patty.

//       2. Cook the patty:
//          Heat a pan with a bit of oil. Cook the patty for 2-3 minutes each side, until browned.

//       3. Assemble the burger:
//          Toast the burger bun halves. Place lettuce and tomato on the bottom half. Add the cooked patty and top with a slice of cheese.

//       4. Serve:
//          Complete the assembly with the top bun and serve hot.
//     `,
//     creator: "Mohammed Mohiuddin",
//     creator_email: "mohibdrs@gmail.com",
//   },
//   {
//     title: "Spicy Curry",
//     slug: "spicy-curry",
//     image: "/images/curry.jpg",
//     summary:
//       "A rich and spicy curry, infused with exotic spices and creamy coconut milk.",
//     instructions: `
//       1. Chop vegetables:
//          Cut your choice of vegetables into bite-sized pieces.

//       2. Sauté vegetables:
//          In a pan with oil, sauté the vegetables until they start to soften.

//       3. Add curry paste:
//          Stir in 2 tablespoons of curry paste and cook for another minute.

//       4. Simmer with coconut milk:
//          Pour in 500ml of coconut milk and bring to a simmer. Let it cook for about 15 minutes.

//       5. Serve:
//          Enjoy this creamy curry with rice or bread.
//     `,
//     creator: "Hasan Mirza",
//     creator_email: "hasan@email.com",
//   },
//   {
//     title: "Homemade Dumplings",
//     slug: "homemade-dumplings",
//     image: "/images/dumplings.jpg",
//     summary:
//       "Tender dumplings filled with savory meat and vegetables, steamed to perfection.",
//     instructions: `
//       1. Prepare the filling:
//          Mix minced meat, shredded vegetables, and spices.

//       2. Fill the dumplings:
//          Place a spoonful of filling in the center of each dumpling wrapper. Wet the edges and fold to seal.

//       3. Steam the dumplings:
//          Arrange dumplings in a steamer. Steam for about 10 minutes.

//       4. Serve:
//          Enjoy these dumplings hot, with a dipping sauce of your choice.
//     `,
//     creator: "Mohammed Anis",
//     creator_email: "anis@email.com",
//   },
//   {
//     title: "Classic Mac n Cheese",
//     slug: "classic-mac-n-cheese",
//     image: "/images/macncheese.jpg",
//     summary:
//       "Creamy and cheesy macaroni, a comforting classic that's always a crowd-pleaser.",
//     instructions: `
//       1. Cook the macaroni:
//          Boil macaroni according to package instructions until al dente.

//       2. Prepare cheese sauce:
//          In a saucepan, melt butter, add flour, and gradually whisk in milk until thickened. Stir in grated cheese until melted.

//       3. Combine:
//          Mix the cheese sauce with the drained macaroni.

//       4. Bake:
//          Transfer to a baking dish, top with breadcrumbs, and bake until golden.

//       5. Serve:
//          Serve hot, garnished with parsley if desired.
//     `,
//     creator: "Hasna Banu",
//     creator_email: "hasna@email.com",
//   },
//   {
//     title: "Authentic Pizza",
//     slug: "authentic-pizza",
//     image: "/images/pizza.jpg",
//     summary:
//       "Hand-tossed pizza with a tangy tomato sauce, fresh toppings, and melted cheese.",
//     instructions: `
//       1. Prepare the dough:
//          Knead pizza dough and let it rise until doubled in size.

//       2. Shape and add toppings:
//          Roll out the dough, spread tomato sauce, and add your favorite toppings and cheese.

//       3. Bake the pizza:
//          Bake in a preheated oven at 220°C for about 15-20 minutes.

//       4. Serve:
//          Slice hot and enjoy with a sprinkle of basil leaves.
//     `,
//     creator: "Shamim Akter",
//     creator_email: "akter@eamil.com",
//   },
//   {
//     title: "Wiener Schnitzel",
//     slug: "wiener-schnitzel",
//     image: "/images/schnitzel.jpg",
//     summary:
//       "Crispy, golden-brown breaded veal cutlet, a classic Austrian dish.",
//     instructions: `
//       1. Prepare the veal:
//          Pound veal cutlets to an even thickness.

//       2. Bread the veal:
//          Coat each cutlet in flour, dip in beaten eggs, and then in breadcrumbs.

//       3. Fry the schnitzel:
//       Heat oil in a pan and fry each schnitzel until golden brown on both sides.

//       4. Serve:
//       Serve hot with a slice of lemon and a side of potato salad or greens.
//  `,
//     creator: "Anju Man Ara",
//     creator_email: "anju@email.com",
//   },
//   {
//     title: "Fresh Tomato Salad",
//     slug: "fresh-tomato-salad",
//     image: "/images/tomato-salad.jpg",
//     summary:
//       "A light and refreshing salad with ripe tomatoes, fresh basil, and a tangy vinaigrette.",
//     instructions: `
//       1. Prepare the tomatoes:
//         Slice fresh tomatoes and arrange them on a plate.

//       2. Add herbs and seasoning:
//          Sprinkle chopped basil, salt, and pepper over the tomatoes.

//       3. Dress the salad:
//          Drizzle with olive oil and balsamic vinegar.

//       4. Serve:
//          Enjoy this simple, flavorful salad as a side dish or light meal.
//     `,
//     creator: "Wasir Ahmed",
//     creator_email: "wasir@email.com",
//   },
// ];

// const createTableQuery = `
//   CREATE TABLE IF NOT EXISTS meals (
//     id SERIAL PRIMARY KEY,
//     slug TEXT NOT NULL UNIQUE,
//     title TEXT NOT NULL,
//     image TEXT NOT NULL,
//     summary TEXT NOT NULL,
//     instructions TEXT NOT NULL,
//     creator TEXT NOT NULL,
//     creator_email TEXT NOT NULL
//   );
// `;

// async function createTable() {
//   try {
//     await client.query(createTableQuery);
//     console.log("Table created successfully or already exists");
//   } catch (error) {
//     console.error("Error creating table:", error);
//   }
// }

// async function initData() {
//   try {
//     console.log("Connected to PostgreSQL");

//     const insertMealQuery = `
//       INSERT INTO meals (slug, title, image, summary, instructions, creator, creator_email)
//       VALUES ($1, $2, $3, $4, $5, $6, $7)
//       ON CONFLICT (slug) DO NOTHING;
//     `;

//     for (const meal of dummyMeals) {
//       await client.query(insertMealQuery, [
//         meal.slug,
//         meal.title,
//         meal.image,
//         meal.summary,
//         meal.instructions,
//         meal.creator,
//         meal.creator_email,
//       ]);
//     }

//     console.log("Dummy data inserted successfully");
//   } catch (error) {
//     console.error("Error inserting dummy data:", error);
//   } finally {
//     await client.end();
//     console.log("PostgreSQL client disconnected");
//   }
// }

// async function initializeDatabase() {
//   await createTable();
//   await initData();
// }

// initializeDatabase();
