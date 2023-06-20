import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import { connectToDataBase } from "@utils/database";
import User from "@models/user";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      const sessionUser = await User.findOne({ email: session.user.email });
      session.user.id = sessionUser._id.toString();
      return session;
    },

    async signIn({ profile }) {
      try {
        //serverless --> lamda
        await connectToDataBase();
        //check if already exist user
        const userExists = await User.findOne({ email: profile.email });
        //if not, then create new user
        if (!userExists) {
          await User.create({
            email: profile.email,
            usetname: profile.name.replace(" ", "").toLowerCase(),
            image: profile.image,
          });
        }
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
