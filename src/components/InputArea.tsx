// UI
import { Button, Dialog, Field, Input, NumberInput } from "@chakra-ui/react"




export default function InputArea({ onChengeInputText, inpuText, onChengeInputTime, inpuTime, onClickRecords, isDisabled }) {

    return (
        <>
            <Dialog.Body>
                <Field.Root required>
                    <Field.Label>
                        学習内容 <Field.RequiredIndicator />
                    </Field.Label>
                    <Input placeholder="学習内容を入力" onChange={onChengeInputText} type="text" id='text' value={inpuText} />
                </Field.Root>

                <Field.Root>
                    <Field.Label>学習時間</Field.Label>
                    <NumberInput.Root required>
                        <NumberInput.Control />
                        <NumberInput.Input onChange={onChengeInputTime} type="number" placeholder='学習時間を入力' id='time' value={inpuTime} />
                    </NumberInput.Root>
                </Field.Root>
            </Dialog.Body>
            <Dialog.Footer>
                <Button bg="blue.fg" fontWeight="semibold" onClick={onClickRecords}>登録する</Button>
            </Dialog.Footer>

        </>
    )
}