import { describe, expect, test, } from "vitest";
import { render, screen, } from "@testing-library/react";
import App from "../App";


describe("App", () => {

    test("タイトルが表示されている", () => {
        render(<App />);
        expect(
            screen.getByRole("heading", { name: "テストコンポーネント" })
        ).toBeInTheDocument();
    });

});