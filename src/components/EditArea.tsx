import type { UseFormRegister, UseFormHandleSubmit, SubmitHandler, FieldErrors } from "react-hook-form";

// UI
import { Button, Dialog, Portal, Input, NumberInput, CloseButton, Field } from "@chakra-ui/react"

import { type Recode } from './Recors'
import { type FormValues } from './InputArea'

type Props = {
    editingRecord: Recode | null
    setEditingRecord: (record: Recode | null) => void         // 編集中のレコードを変える関数
    handleSubmitEdit: UseFormHandleSubmit<FormValues>
    onSubmitEdit: SubmitHandler<FormValues>
    registerEdit: UseFormRegister<FormValues>
    editErrors: FieldErrors<FormValues>
}


export default function EditArea({ editingRecord, setEditingRecord, handleSubmitEdit, onSubmitEdit, registerEdit, editErrors }: Props) {

    return (
        <>
            {/* 編集用のモーダル（1つだけ用意し、editingRecordの内容を編集する） */}
            <Dialog.Root open={editingRecord !== null} onOpenChange={(e) => { if (!e.open) setEditingRecord(null) }}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            < form onSubmit={handleSubmitEdit(onSubmitEdit)}>
                                <Dialog.Header>
                                    <Dialog.Title>編集登録</Dialog.Title>
                                </Dialog.Header>
                                {/* 編集・入力エリア */}
                                <Dialog.Body>
                                    <Field.Root required>
                                        <Field.Label>
                                            学習内容 <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input type="text" placeholder='学習内容を入力' id='edit-text' {...registerEdit("title", { required: "学習内容は必須です" })} />
                                        {editErrors.title && <p className='error'> {editErrors.title.message}</p>}
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Label>学習時間</Field.Label>
                                        <NumberInput.Root required>
                                            <NumberInput.Control />
                                            <NumberInput.Input type="number" placeholder='学習時間を入力' id='edit-time' {...registerEdit("time", {
                                                required: "学習時間は必須です", min: {
                                                    value: 1,
                                                    message: "時間は1以上である必要があります"
                                                }
                                            })} />
                                        </NumberInput.Root>
                                        {editErrors.time && <p className='error'>{editErrors.time.message}</p>}
                                    </Field.Root>
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Dialog.ActionTrigger asChild>
                                        <Button variant="outline">キャンセル</Button>
                                    </Dialog.ActionTrigger>
                                    <Button type="submit" bg="blue.fg" fontWeight="semibold">更新する</Button>
                                </Dialog.Footer>
                            </form>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

        </>
    )
}