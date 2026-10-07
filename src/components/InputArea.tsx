import type { UseFormRegister, UseFormHandleSubmit, SubmitHandler, FieldErrors } from "react-hook-form";

// UI
import { Button, Dialog, Portal, Input, NumberInput, CloseButton } from "@chakra-ui/react"

// フォームの入力値の型
export type FormValues = {
    title: string
    time: number
}

type Props = {
    isOpen: boolean
    setIsOpen: (open: boolean) => void                // 開閉状態を変える関数
    handleSubmit: UseFormHandleSubmit<FormValues>     // useForm の handleSubmit
    onSubmit: SubmitHandler<FormValues>               // 入力値を受け取る送信処理
    register: UseFormRegister<FormValues>             // useForm の register
    errors: FieldErrors<FormValues>                   // formState.errors
}


export default function InputArea({ isOpen, setIsOpen, handleSubmit, onSubmit, register, errors }: Props) {

    return (
        <>
            <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <Dialog.Trigger asChild>
                    <Button size="xl" bg="pink.solid" fontWeight="semibold">新規登録</Button>
                </Dialog.Trigger>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            < form onSubmit={handleSubmit(onSubmit)} >
                                <Dialog.Header>
                                    <Dialog.Title>新規登録</Dialog.Title>
                                </Dialog.Header>
                                {/* 入力エリア */}
                                <Dialog.Body>
                                    <div>
                                        <label htmlFor="text">
                                            学習内容
                                        </label>
                                        <Input type="text" placeholder='学習内容を入力' id='text'  {...register("title", { required: "学習内容は必須です" })} />
                                        {errors.title && <p className='error'>{errors.title.message}</p>}

                                    </div>
                                    <div className='time-wrapper'>
                                        <label htmlFor="time">
                                            学習時間
                                        </label>
                                        <NumberInput.Root>
                                            <NumberInput.Control />
                                            <NumberInput.Input type="number" placeholder='学習時間を入力' id='time'  {...register("time", {
                                                required: "学習時間は必須です", min: {
                                                    value: 1,
                                                    message: "時間は1以上である必要があります"
                                                }
                                            })} />
                                        </NumberInput.Root>
                                        時間
                                        {errors.time && <p className='error'>{errors.time.message}</p>}

                                    </div>

                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Dialog.ActionTrigger asChild>
                                        <Button variant="outline" size="md">キャンセル</Button>
                                    </Dialog.ActionTrigger>
                                    <Button type="submit" bg="teal.600" size="md" className='submit-button'>登録</Button>

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