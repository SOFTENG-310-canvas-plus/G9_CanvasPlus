import { describe, it, expect, vi, beforeEach } from "vitest";

// mock must load before importing your module
vi.mock("@supabase/supabase-js");


import {getUserId, supabase} from "../../auth/supabaseClient.js";
import {__setAuthUser, createClient} from "./supabase-js.js";

describe("supabaseClient", () => {
    beforeEach(() => vi.clearAllMocks());

    it("creates client with URL and key", () => {
        expect(createClient).toHaveBeenCalledTimes(1);
        const [url, key] = createClient.mock.calls[0];
        expect(typeof url).toBe("string");
        expect(typeof key).toBe("string");
        expect(supabase).toBeTruthy();
    });

    it("getUserId returns current user id", async () => {
        __setAuthUser({ id: "abc-123" });
        await expect(getUserId()).resolves.toBe("abc-123");
    });

    it("getUserId returns undefined when signed out", async () => {
        __setAuthUser(null);
        await expect(getUserId()).resolves.toBeUndefined();
    });
});
