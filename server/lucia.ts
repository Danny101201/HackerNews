import { Lucia, TimeSpan } from "lucia";
import { adapter } from "./adapter";


export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production"
    }
  },

  // getSessionAttributes: (attributes) => {
  //   // const session = await lucia.createSession(userId, {
  //   //   country: "us"
  //   // });
  //   console.log({ attributes })
  //   return {
  //     country: attributes
  //   };
  // },
  getUserAttributes(attributes) {
    return {
      userName: attributes.userName
    };

  },
  sessionExpiresIn: new TimeSpan(2, 'w')
});

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    // DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
  interface DatabaseUserAttributes {
    userName: string;
  }
}