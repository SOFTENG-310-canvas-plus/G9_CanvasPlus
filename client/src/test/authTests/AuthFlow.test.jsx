import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("@supabase/supabase-js");


import {AuthProvider} from "../../auth/AuthProviders.jsx";
import UserLogin from "../../auth/UserLogin.jsx";
import ProtectedRoute from "../../auth/ProtectedRoutes.jsx";
import {__setAuthUser, __setErrors} from "./supabase-js.js";


function CanvasPlus() { return <div>CanvasPlus (Dashboard)</div>; }

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<UserLogin />} />
                <Route
                    path="/canvas-plus"
                    element={
                        <ProtectedRoute>
                            <CanvasPlus />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AuthProvider>
    );
}

describe("Auth flow integration", () => {
    beforeEach(() => {
        __setAuthUser(null);
        __setErrors({});
    });

    it("unauthenticated visit to /canvas-plus redirects to /login", async () => {
        render(
            <MemoryRouter initialEntries={["/canvas-plus"]}>
                <App />
            </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByText(/login/i)).toBeInTheDocument());
    });

    it("sign-in redirects to /canvas-plus", async () => {
        render(
            <MemoryRouter initialEntries={["/login"]}>
                <App />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "a@b.com" } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "pw" } });
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => expect(screen.getByText(/CanvasPlus \(Dashboard\)/i)).toBeInTheDocument());
    });
});
