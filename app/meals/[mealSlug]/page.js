import Image from "next/image";
import { notFound } from "next/navigation";

import { getMeal } from "@/lib/meals";
import classes from "./page.module.css";

export async function generateMetadata({ params }) {
  const meal = getMeal(params.mealSlug);

  // console.log("Meals", params.mealSlug);
  if (!meal) {
    notFound();
  }

  return {
    title: meal.title,
    description: meal.summary,
  };
}

export default async function MealDetailsPage({ params }) {
  const meal = await getMeal(params.mealSlug);

  if (!meal) {
    notFound();
  }

  meal.instructions = meal.rows[0].instructions.replace(/\n/g, "<br />");

  return (
    <>
      <header className={classes.header}>
        <div className={classes.image}>
          <Image
            // src={`https://maxschwarzmueller-nextjs-demo-users-image.s3.amazonaws.com/${meal.image}`}
            src={`https://mohiuddinextjs.s3.ap-south-1.amazonaws.com${meal.rows[0].image}`}
            // src={meal.image}
            alt={meal.rows[0].title}
            fill
          />
        </div>
        <div className={classes.headerText}>
          <h1>{meal.rows[0].title}</h1>
          <p className={classes.creator}>
            by{" "}
            <a href={`mailto:${meal.rows[0].creator_email}`}>
              {meal.rows[0].creator}
            </a>
          </p>
          <p className={classes.summary}>{meal.rows[0].summary}</p>
        </div>
      </header>
      <main>
        <p
          className={classes.instructions}
          dangerouslySetInnerHTML={{
            __html: meal.instructions,
          }}></p>
      </main>
    </>
  );
}
