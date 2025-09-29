import ky, { type HTTPError } from "ky";
import { useEffect } from "react";

export default function Test() {
  useEffect(() => {
    (async () => {
      const url = "https://localhost:7035/api/Accounts/register"; // returns 400 with JSON body: { code:400, description: "Bad Request" }

      // ---------- ky (fetch-based) ----------
      try {
        // Note: ky will throw on non-2xx responses, so this will jump to catch
        const data = await ky.post(url).json();
        console.log("ky success:", data);
      } catch (error) {
        const err = error as HTTPError;

        console.log(error);
        console.log(err.name);
        console.log(err.message);
        console.log("=======================");
        console.log(err.request);
        console.log(err.response);
        console.log("=======================");
        console.log(JSON.stringify(err, null, 4));
        console.log(await err.response.json());

        // console.log("ky - thrown error object:", err);
        // console.log(err);

        // // ky's thrown error has a `response` which is the fetch Response
        // // You can inspect the raw Response object:
        // if (err && err.response) {
        //   console.log("ky - error.response (raw fetch Response):", err.response);

        //   // To get the body you must *explicitly* read/parse it:
        //   try {
        //     const parsed = await err.response.json(); // parse the JSON body
        //     console.log("ky - parsed error body (await err.response.json()):", parsed);
        //   } catch (parseErr) {
        //     console.log("ky - failed to parse error body:", parseErr);
        //   }
        // } else {
        //   console.log("ky - no response on the error object");
        // }
      }
    })();
  }, []);

  return <div>TEST</div>;
}
