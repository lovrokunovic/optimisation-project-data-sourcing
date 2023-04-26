import fs from "fs";
import { parse } from "csv-parse";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
fs.createReadStream("./csv-data/data.csv")
  .pipe(
    parse({
      delimiter: ",",
      trim: true,
      skip_empty_lines: true,
    })
  )
  .on("data", async (row) => {
    const message = row[row.length - 1];
    const user = row[row.length - 2];

    try {
      await prisma.user.upsert({
        where: { username: user },
        update: { username: user },
        create: { username: user, email: user + "@mail.co" },
      });
      await prisma.message.create({
        data: {
          text: message,
          user: { connect: { username: user } },
          room: {
            connectOrCreate: {
              where: { id: 3 },
              create: { id: 3, name: "unknown" },
            },
          },
        },
      });
    } catch (error) {
      console.error(`Error processing row ${row}: ${error}`);
    }
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
  });
