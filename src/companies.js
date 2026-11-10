// Companies to watch. "slug" is the company's board name on that platform,
// taken from its careers page URL:
//   https://boards.greenhouse.io/postman   -> greenhouse, "postman"
//   https://jobs.lever.co/cred             -> lever, "cred"
//   https://jobs.ashbyhq.com/zepto         -> ashby, "zepto"
// These are starting examples. Run `npm run check`, remove any that FAIL,
// and add companies you actually want to work at.

export const COMPANIES = [
  { name: "Groww", platform: "greenhouse", slug: "groww" },
  { name: "Druva", platform: "greenhouse", slug: "druva" },
  { name: "CRED", platform: "lever", slug: "cred" },
  { name: "Meesho", platform: "lever", slug: "meesho" },
  { name: "Atlan", platform: "ashby", slug: "atlan" },
  { name: "Safe Security", platform: "lever", slug: "safe" },
  { name: "PeopleGrove", platform: "lever", slug: "peoplegrove" },
  { name: "JumpCloud", platform: "lever", slug: "jumpcloud" },
  { name: "Simpplr", platform: "greenhouse", slug: "simpplr" },
  { name: "GHX", platform: "greenhouse", slug: "globalhealthcareexchangeinc" },
  {
    name: "Razorpay",
    platform: "greenhouse",
    slug: "razorpaysoftwareprivatelimited",
  },
  { name: "Plane", platform: "ashby", slug: "plane" },
  { name: "AiPrise", platform: "ashby", slug: "aiprise" },
  { name: "Ema", platform: "ashby", slug: "ema" },
];
