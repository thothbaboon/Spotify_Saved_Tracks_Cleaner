import dotenv from "dotenv";
dotenv.config();

import { z } from "zod";
import express, { Request, Response } from "express";
import querystring from "querystring";
import axios from "axios";
import cors from "cors";
import { createRandomString } from "./utils";

const envSchema = z.object({
  CLIENT_ID: z.string(),
  CLIENT_SECRET: z.string(),
  PORT: z.string(),
  LOGIN_REDIRECT_URI: z.string(),
});

try {
  envSchema.parse(process.env);
} catch (error: any) {
  console.error("Missing or invalid environment variables:", error.errors);
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("src"));

const scopes = [
  "user-read-private",
  "user-read-email",
  "user-library-read",
  "user-library-modify",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
];

const handleAxiosError = (
  error: any,
  defaultMessage: string,
  res: Response
): void => {
  console.error(`Error: ${defaultMessage}`, error);

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const status = error.response.status || 500;
    const message = error.response.data?.error?.message || defaultMessage;
    res.status(status).json({ error: message });
    return;
  } else if (error.request) {
    // The request was made but no response was received
    res.status(503).json({ error: "Service unavailable" });
    return;
  } else {
    // Something happened in setting up the request that triggered an Error
    res.status(500).json({ error: defaultMessage });
    return;
  }
};

app.get("/login", (_, res: Response): void => {
  res.json({
    url:
      "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: process.env.CLIENT_ID,
        scope: scopes.join(" "),
        redirect_uri: process.env.LOGIN_REDIRECT_URI,
        state: createRandomString(16),
      }),
  });
});

app.get("/callback", async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.query.state) {
      res.redirect(
        "/#" +
          querystring.stringify({
            error: "state_mismatch",
          })
      );
      return;
    }

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      {
        code: req.query.code,
        redirect_uri: process.env.LOGIN_REDIRECT_URI,
        grant_type: "authorization_code",
      },
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
            ).toString("base64"),
        },
      }
    );

    const responseData = response.data as {
      access_token: string;
      refresh_token: string;
    };

    const me = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: "Bearer " + responseData.access_token,
      },
    });

    const meData = me.data as { id: string; display_name: string };

    res.redirect(
      "/#" +
        querystring.stringify({
          accessToken: responseData.access_token,
          refreshToken: responseData.refresh_token,
          userId: meData.id,
          userName: meData.display_name,
          clientId: process.env.CLIENT_ID,
        })
    );
  } catch (error: any) {
    handleAxiosError(error, "Authentication error", res);
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
