import { neon } from "@neondatabase/serverless";
import fs from "node:fs";

const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const base = (env.match(/DATABASE_URL=(.+)/) || [])[1].trim();

const pw = (base.match(/:\/\/[^:]+:([^@]+)@/) || [])[1];
const variants = {
  pooled_as_is: base,
  pooled_no_cb: base.replace("&channel_binding=require", ""),
  direct: base.replace("-pooler.", ".").replace("&channel_binding=require", ""),
  g0g_direct: `postgresql://neondb_owner:${pw}@ep-falling-flower-bhvhugml-g0g.c-10.eu-central-1.aws.neon.tech/neondb?sslmode=require`,
  g0g_pooler: `postgresql://neondb_owner:${pw}@ep-falling-flower-bhvhugml-g0g-pooler.c-10.eu-central-1.aws.neon.tech/neondb?sslmode=require`,
  direct_options: `postgresql://neondb_owner:${pw}@ep-falling-flower-bhvhugml.c-10.eu-central-1.aws.neon.tech/neondb?sslmode=require&options=endpoint%3Dep-falling-flower-bhvhugml`,
};

for (const [name, url] of Object.entries(variants)) {
  try {
    const sql = neon(url);
    const r = await sql`SELECT 1 AS ok`;
    console.log(name, "OK", JSON.stringify(r));
  } catch (e) {
    console.log(name, "FAIL", e.message);
  }
}
