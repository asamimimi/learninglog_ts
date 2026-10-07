import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "../theme";
import App from "../App";

// ----------------------------------------
// Supabase のモック
// ----------------------------------------
// vi.mock はファイルの先頭に巻き上げられるため、
// モック関数は vi.hoisted で先に作っておく
const { selectMock, insertMock, deleteMock, eqMock } = vi.hoisted(() => ({
    selectMock: vi.fn(),
    insertMock: vi.fn(),
    deleteMock: vi.fn(),
    eqMock: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
    createClient: () => ({
        from: () => ({
            select: selectMock,
            insert: insertMock,
            delete: deleteMock,
        }),
    }),
}));

// テスト用の学習記録データ
const initialRecords = [
    { id: 1, title: "React", time: 2 },
    { id: 2, title: "TypeScript", time: 3 },
];

// Chakra UI のコンポーネントは ChakraProvider の中でないと動かないため包んで描画する
const renderApp = () =>
    render(
        <ChakraProvider value={system}>
            <App />
        </ChakraProvider>
    );

// 新規登録モーダルを開いて、モーダル（dialog）要素を返す
const openModal = async () => {
    fireEvent.click(screen.getByRole("button", { name: "新規登録" }));
    return await screen.findByRole("dialog");
};

beforeEach(() => {
    vi.clearAllMocks();
    // 初期表示では initialRecords を返す
    selectMock.mockResolvedValue({ data: initialRecords, error: null });
    insertMock.mockResolvedValue({ error: null });
    deleteMock.mockReturnValue({ eq: eqMock });
    eqMock.mockResolvedValue({ error: null });
});

describe("App", () => {

    test("ローディング画面をみることができる", async () => {
        // データ取得が終わらない状態にして、ローディング中を再現する
        selectMock.mockReturnValue(new Promise(() => { }));
        renderApp();

        expect(await screen.findByText("Loading...")).toBeInTheDocument();
    });

    test("テーブルをみることができる", async () => {
        renderApp();

        expect(await screen.findByRole("table")).toBeInTheDocument();
        expect(await screen.findByText("React")).toBeInTheDocument();
        expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

    test("新規登録ボタンがある", async () => {
        renderApp();

        expect(screen.getByRole("button", { name: "新規登録" })).toBeInTheDocument();
        await screen.findByText("React");
    });

    test("タイトルがあること", async () => {
        renderApp();

        expect(
            screen.getByRole("heading", { name: "新・学習記録アプリ" })
        ).toBeInTheDocument();
        await screen.findByText("React");
    });

    test("学習記録が登録できること", async () => {
        renderApp();
        await screen.findByText("React");

        // 登録後の再取得では、新しい記録を含むデータを返す
        selectMock.mockResolvedValue({
            data: [...initialRecords, { id: 3, title: "Vitest", time: 4 }],
            error: null,
        });

        const modal = await openModal();
        fireEvent.change(within(modal).getByPlaceholderText("学習内容を入力"), { target: { value: "Vitest" } });
        fireEvent.change(within(modal).getByPlaceholderText("学習時間を入力"), { target: { value: "4" } });
        fireEvent.click(within(modal).getByRole("button", { name: "登録" }));

        // Supabase の insert が入力値で呼ばれている
        await waitFor(() => {
            expect(insertMock).toHaveBeenCalledWith([{ title: "Vitest", time: "4" }]);
        });
        // 再取得したデータが一覧に表示される
        expect(await screen.findByText("Vitest")).toBeInTheDocument();
    });

    test("モーダルが新規登録というタイトルになっている", async () => {
        renderApp();
        await screen.findByText("React");

        const modal = await openModal();
        expect(within(modal).getByRole("heading", { name: "新規登録" })).toBeInTheDocument();
    });

    test("学習内容がないときに登録するとエラーがでる", async () => {
        renderApp();
        await screen.findByText("React");

        const modal = await openModal();
        fireEvent.change(within(modal).getByPlaceholderText("学習時間を入力"), { target: { value: "2" } });
        fireEvent.click(within(modal).getByRole("button", { name: "登録" }));

        expect(await within(modal).findByText("学習内容は必須です")).toBeInTheDocument();
        expect(within(modal).queryByText("学習時間は必須です")).not.toBeInTheDocument();
        expect(insertMock).not.toHaveBeenCalled();
    });

    test("学習時間がないときに登録するとエラーがでる", async () => {
        renderApp();
        await screen.findByText("React");

        const modal = await openModal();
        fireEvent.change(within(modal).getByPlaceholderText("学習内容を入力"), { target: { value: "React" } });
        fireEvent.click(within(modal).getByRole("button", { name: "登録" }));

        expect(await within(modal).findByText("学習時間は必須です")).toBeInTheDocument();
        expect(within(modal).queryByText("学習内容は必須です")).not.toBeInTheDocument();
        expect(insertMock).not.toHaveBeenCalled();
    });

    test("未入力のエラー", async () => {
        renderApp();
        await screen.findByText("React");

        // 何も入力せずに登録する
        const modal = await openModal();
        fireEvent.click(within(modal).getByRole("button", { name: "登録" }));

        expect(await within(modal).findByText("学習内容は必須です")).toBeInTheDocument();
        expect(within(modal).getByText("学習時間は必須です")).toBeInTheDocument();
        expect(insertMock).not.toHaveBeenCalled();
    });

    test("0以上でないときのエラー", async () => {
        renderApp();
        await screen.findByText("React");

        const modal = await openModal();
        fireEvent.change(within(modal).getByPlaceholderText("学習内容を入力"), { target: { value: "React" } });
        fireEvent.change(within(modal).getByPlaceholderText("学習時間を入力"), { target: { value: "0" } });
        fireEvent.click(within(modal).getByRole("button", { name: "登録" }));

        expect(await within(modal).findByText("時間は1以上である必要があります")).toBeInTheDocument();
        expect(insertMock).not.toHaveBeenCalled();
    });

    test("学習記録が削除できること", async () => {
        renderApp();
        await screen.findByText("React");

        // 削除後の再取得では、id: 1 を除いたデータを返す
        selectMock.mockResolvedValue({ data: [initialRecords[1]], error: null });

        // 1行目（React）の削除ボタンを押す
        const row = screen.getByText("React").closest("tr")!;
        fireEvent.click(within(row).getByRole("button", { name: "削除" }));

        // Supabase の delete が id: 1 で呼ばれている
        await waitFor(() => {
            expect(deleteMock).toHaveBeenCalled();
            expect(eqMock).toHaveBeenCalledWith("id", 1);
        });
        // 一覧から消えている
        await waitFor(() => {
            expect(screen.queryByText("React")).not.toBeInTheDocument();
        });
        expect(screen.getByText("TypeScript")).toBeInTheDocument();
    });

});
