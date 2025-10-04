import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

vi.mock("@supabase/supabase-js");

import {AuthProvider, useAuth} from "../../auth/AuthProviders.jsx";
import {__setAuthUser} from "./supabase-js.js";

function Probe() {
    const { user, userId, session, loading, signOut, signIn, signUp } = useAuth();
    return (
        <div>
            <div data-testid="loading">{String(loading)}</div>
            <div data-testid="userId">{userId ?? ""}</div>
            <div data-testid="hasUser">{String(!!user)}</div>
            <div data-testid="hasSession">{String(!!session)}</div>
            <button onClick={() => signOut()}>signOut</button>
            <button onClick={() => signIn?.({ email: "x@y.com", password: "p" })}>signIn</button>
            <button onClick={() => signUp?.({ email: "n@y.com", password: "p" })}>signUp</button>
        </div>
    );
}

describe("AuthProvider / useAuth", () => {
    beforeEach(() => vi.clearAllMocks());

    it("exposes current user from initial getUser()", async () => {
        __setAuthUser({ id: "init-123", email: "init@a.com" });
        render(
            <AuthProvider>
                <Probe />
            </AuthProvider>
        );
        await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
        expect(screen.getByTestId("userId").textContent).toBe("init-123");
        expect(screen.getByTestId("hasUser").textContent).toBe("true");
        expect(screen.getByTestId("hasSession").textContent).toBe("true");
    });

    it("updates on onAuthStateChange events", async () => {
        __setAuthUser(null);
        render(
            <AuthProvider>
                <Probe />
            </AuthProvider>
        );
        await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
        expect(screen.getByTestId("hasUser").textContent).toBe("false");

        __setAuthUser({ id: "live-999", email: "live@ex.com" });
        __triggerAuthEvent("SIGNED_IN");
        await waitFor(() => expect(screen.getByTestId("userId").textContent).toBe("live-999"));

        __setAuthUser(null);
        __triggerAuthEvent("SIGNED_OUT");
        await waitFor(() => expect(screen.getByTestId("hasUser").textContent).toBe("false"));
    });

    it("exposes signIn/signUp/signOut handlers", async () => {
        __setAuthUser(null);
        render(
            <AuthProvider>
                <Probe />
            </AuthProvider>
        );
        await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

        fireEvent.click(screen.getByText("signUp"));
        await waitFor(() => expect(screen.getByTestId("hasUser").textContent).toBe("true"));

        fireEvent.click(screen.getByText("signOut"));
        await waitFor(() => expect(screen.getByTestId("hasUser").textContent).toBe("false"));

        fireEvent.click(screen.getByText("signIn"));
        await waitFor(() => expect(screen.getByTestId("hasUser").textContent).toBe("true"));
    });
});
