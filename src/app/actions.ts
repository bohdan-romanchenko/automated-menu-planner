"use server";

import { openai } from "~/lib/openai";
import { supabase } from "~/lib/supabase";
import { getAllProducts } from "~/lib/products";
import { type PostgrestSingleResponse } from "@supabase/supabase-js";

interface Menu {
  id: number;
  content: string;
  created_at: string;
}

export async function generateMenu() {
  try {
    // Get available products
    const products = await getAllProducts();
    const availableProducts = products
      .filter((p) => p.available)
      .map((p) => p.name)
      .join(", ");

    // Generate menu using OpenAI
    const prompt = `Створіть меню на тиждень використовуючи ці продукти: ${availableProducts}.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
[Роль]
Ти експерт з нутріціології і здоровому харчуванню. 

[Задача]
Тобі треба буде робити меню на тиждень базуючись на доступних продуктах, які будуть додаватися до запиту. 
Меню має бути поживним. Меню має складатися з: Сніданок, перекус, обід, перекус, вечеря. 
Меню має бути написано на кожен день тижня починаючи з понеділка. 
Меню має формуватися за вирахуваннями пониження холестерину в організмі. 

All answers should be in Ukrainian.
All answers should be in JSON format.
[приклад відповіді]
{
  "monday": {
    "breakfast": "Вівсянка з лляним насінням, горіхами та ягодами",
    "snack1": "Груша + жменя мигдалю", 
    "lunch": "Гречка з тушкованими овочами + запечена куряча грудка",
    "snack2": "Грецький йогурт + насіння чіа",
    "dinner": "Салат із авокадо, шпинату, квасолі + цільнозерновий хліб"
  },
  "tuesday": {
    "breakfast": "Омлет із білків із зеленню + житній хліб з авокадо",
    "snack1": "Яблуко + волоські горіхи",
    "lunch": "Червона сочевиця з овочами + запечена риба", 
    "snack2": "Морква та селера з хумусом",
    "dinner": "Грильований лосось + кіноа + салат із броколі"
  },
  "wednesday": {
    "breakfast": "Гречані млинці з натуральним йогуртом та ягодами",
    "snack1": "Фундук + 1 банан",
    "lunch": "Овочевий суп + запечене куряче філе з булгуром",
    "snack2": "Гарбузове насіння + зелений чай", 
    "dinner": "Соте з кабачків, помідорів та нуту + цільнозерновий хліб"
  },
  "thursday": {
    "breakfast": "Цільнозерновий тост із арахісовою пастою + банан",
    "snack1": "Яблуко + мигдаль",
    "lunch": "Салат із кіноа, руколи, граната та авокадо + запечена риба",
    "snack2": "Натуральний йогурт із насінням льону",
    "dinner": "Овочеве рагу з сочевицею"
  },
  "friday": {
    "breakfast": "Вівсянка з насінням чіа та горіхами",
    "snack1": "Апельсин + волоські горіхи",
    "lunch": "Грильована курка + салат із капусти, моркви та яблука",
    "snack2": "Овочевий смузі (селера, огірок, шпинат, лимон)",
    "dinner": "Риба, запечена з овочами + кіноа"
  },
  "saturday": {
    "breakfast": "Омлет із овочами та зеленню + житній тост",
    "snack1": "Гарбузове насіння + натуральний йогурт",
    "lunch": "Овочевий борщ без м'яса + цільнозерновий хліб",
    "snack2": "Фрукти + жменя мигдалю",
    "dinner": "Запечені баклажани з нутом і томатним соусом"
  },
  "sunday": {
    "breakfast": "Цільнозерновий хліб із авокадо та лососем",
    "snack1": "Грушевий смузі з мигдальним молоком",
    "lunch": "Гречка + тушковані гриби + зелений салат",
    "snack2": "Фрукти та жменя горіхів",
    "dinner": "Печена риба з брюссельською капустою"
  }
}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const menuContent = completion.choices[0]?.message?.content;

    console.log("got menu content", menuContent);
    if (!menuContent) {
      throw new Error("Failed to generate menu content");
    }

    // Save to database
    const { data, error }: PostgrestSingleResponse<Menu> = await supabase
      .from("menus")
      .insert([{ content: menuContent }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error generating menu:", error);
    throw new Error("Failed to generate menu");
  }
}
