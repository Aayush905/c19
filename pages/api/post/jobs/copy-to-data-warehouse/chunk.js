import db from '../../../../../db';
import dwh from '../../../../../dwh';
import rollbar from '../../../../../rollbar';
import { sendSMS } from '../../../../../twilio';
import smsContent from '../../../../../content/sms';
const secret = process.env.SECRET;
const adminPassword = process.env.ADMIN_PASSWORD;

export default async (req, res) => {
  try {
    const { password, chunk } = req.body;

    if (password === adminPassword) {
      dwh.task(async t => {
        await t.batch(
          chunk.map(person => {
            return t.one(
              `insert into "survey"
              (
                id,
                value,
                date,
                person
              )
              VALUES
              (
                $/id/,
                $/value/,
                $/date/,
                $/person/
              )
              on conflict (id)
                do update
                set
                  value = $/value/,
                  date = $/date/,
                  person = $/person/
                where "survey".id = $/id/
              returning *`,
              {
                id: person.id,
                value: person.value,
                date: person.date,
                person: person.person,
              }
            );
          })
        );
      });
    }
    res.status(200).end();
  } catch (error) {
    console.error(error);
    rollbar.error(error);
    res.status(500).end();
  }
};
