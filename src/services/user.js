import { randomBytes } from "crypto";

import { User } from "../models/init.js";
import DatabaseError from "../models/error.js";
import { generatePasswordHash, validatePassword } from "../utils/password.js";
import {createClient} from "@supabase/supabase-js";
import config from "../utils/config.js";

const generateRandomToken = () =>
  randomBytes(48).toString("base64").replace(/[+/]/g, ".");

export const supabase = createClient('https://pfvmbijsselazjeclpcv.supabase.co', config.SUPABASE_KEY)

class UserService {
  static async list() {
    try {
      const users = await User.findMany();
      return users.map((u) => ({ ...u, password: undefined }));
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async get(id) {
    try {
      const user = await User.findUnique({
        where: { id },
      });

      if (!user) return null;

      delete user.password;
      return user;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async update(id, data) {
    try {
      return User.update(
        {
          where: { id },
        },
        {
          data,
        }
      );
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async delete(id) {
    try {
      return User.delete({
        where: { id },
      });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async authenticateWithPassword(email, password) {
    try {
      const user = await User.findUnique({
        where: { email },
      });
      if (!user) return null;

      const passwordValid = await validatePassword(password, user.password);

      if (!passwordValid) return null;

      user.lastLoginAt = Date.now();
      const updatedUser = await User.update({
        where: { id: user.id },
        data: { lastLoginAt: user.lastLoginAt },
      });

      delete updatedUser.password;
      return updatedUser;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async authenticateWithToken(token) {
    try {
      const supabaseUser = await supabase.auth.getUser(token)
      const user = supabaseUser.data.user
      if (!user) return null;

      delete user.password;

      return user;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async createUser({ id, ...userData }) {

    try {
      const data = {
        ...userData,
        id: id
      };

      const user = await User.create({ data });

      return user;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async setPassword(user, password) {
    user.password = await generatePasswordHash(password); // eslint-disable-line

    try {
      if (user.id) {
        return User.update({
          where: { id: user.id },
          data: { password: user.password },
        });
      }

      return user;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async regenerateToken(user) {
    user.token = generateRandomToken(); // eslint-disable-line

    try {
      if (user.id) {
        return User.update({
          where: { id: user.id },
          data: { password: user.password },
        });
      }

      return user;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }
}

export default UserService;
