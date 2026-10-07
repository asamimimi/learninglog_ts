// UI
import { Table, Icon } from "@chakra-ui/react"
import { FaPen, FaTrashAlt } from "react-icons/fa";

// 型指定
export type Recode = {
    id: number,
    title: string,
    time: number
}

type Props = {
    record: Recode
    onClickDelete: (id: number) => void      // 削除するレコードのidを受け取る関数
    onClickEdit: (record: Recode) => void    // 編集するレコードを受け取る関数
}

export default function RecordList({ record, onClickDelete, onClickEdit }: Props) {

    return (
        <>
            <Table.Row>
                <Table.Cell>{record.title}</Table.Cell>
                <Table.Cell>{record.time}時間</Table.Cell>
                <Table.Cell textAlign="center">
                    {/* 編集画面オープンのトリガーアイコン */}
                    <button onClick={() => onClickEdit(record)} className='btn' aria-label="編集">
                        <Icon size="lg" color="gray.400">
                            <FaPen />
                        </Icon>
                    </button>
                </Table.Cell>
                <Table.Cell textAlign="center">
                    <button onClick={() => onClickDelete(record.id)} className='btn' aria-label="削除">
                        <Icon size="lg" color="gray.400">
                            <FaTrashAlt />
                        </Icon>
                    </button>
                </Table.Cell>
            </Table.Row>

        </>
    )
}