import { useState, useEffect } from 'react'
import { useForm } from "react-hook-form";
import { createClient } from '@supabase/supabase-js';

// UI
import { Button, CloseButton, Dialog, Portal, Table, Icon, Field, Input, NumberInput } from "@chakra-ui/react"
import { FaPen, FaTrashAlt } from "react-icons/fa";

import './App.css'


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 型指定
type Recode = {
  id: number,
  title: string,
  time: number
}




export default function App() {

  // 学習記録
  const [records, setRecords] = useState<Recode[]>([])


  // 入力テキスト
  const [inpuText, setInputText] = useState("");
  const [inpuTime, setInputTime] = useState(0);

  // ダイアログの開閉
  const [open, setOpen] = useState(false);


  // 合計時間
  const totalTime = records.reduce((sum, content) => {
    // 文字列として扱われないよう、Number()で数値に変換
    return sum + Number(content.time);
  }, 0); // 0 は初期値（sumの最初の値）



  // モーダルの開閉
  const [isOpen, setIsOpen] = useState(false);

  // ローデイング管理
  const [isLoading, setIsLoading] = useState(true);


  // ページ読み込み時のデータ取得
  useEffect(() => {
    async function fetchRecords() {
      setIsLoading(true); // ①読み込み開始！
      const { data, error } = await supabase.from('study-record').select()
      if (error) {
        console.error(error)
        return
      }
      setRecords(data)

    }
    fetchRecords()
  }, [])



  // 登録時データ取得用の関数
  const fetchData = async () => {
    const { data, error } = await supabase.from('study-record').select("*");
    if (error) {
      console.error("データ取得エラー:", error);
      return;
    }
    setRecords(data);
  };

  // 入力されたテキストを取得
  const onChengeInputText = (e) => {
    setInputText(e.target.value);
  }
  // 入力された時間を取得
  const onChengeInputTime = (e) => {
    setInputTime(e.target.value);
  }


  // フォーム管理・データ登録
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = async (data) => {
    try {
      const { error } = await supabase.from('study-record').insert([{
        title: data.title,
        time: data.time,
      }]);
      if (error) {
        console.error("登録エラー", error);
        return;
      }
      // 登録成功時のみモーダルを閉じる
      setIsOpen(false);
      await fetchData();
    } catch (error) {
      console.error("通信エラー", error);
    }
  };


  // 削除機能
  const onClickDelete = async (id: number) => {
    const { error } = await supabase
      .from('study-record')
      .delete()
      .eq('id', id);
    if (error) {
      console.error("データ削除エラー:", error);
      return;
    }
    await fetchData();
  };



  return (
    <>
      <div className='wrapper'>


        <h1>新・学習記録アプリ</h1>
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
                      {errors.title && <p>{errors.title.message}</p>}

                    </div>
                    <div>
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
                      {errors.time && <p>{errors.time.message}</p>}

                    </div>
                    <Dialog.ActionTrigger asChild>
                      <Button variant="outline">キャンセル</Button>
                    </Dialog.ActionTrigger>
                    <Button onClick={onSubmit} type="submit" bg="teal.600">登録</Button>

                  </Dialog.Body>
                </form>

                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>


        {/* テーブル */}
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>学習内容</Table.ColumnHeader>
              <Table.ColumnHeader>学習時間</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end"></Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end"></Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>

            {records.map((record) => {
              return (
                <Table.Row key={record.id}>
                  <Table.Cell>{record.title}</Table.Cell>
                  <Table.Cell>{record.time}時間</Table.Cell>
                  <Table.Cell textAlign="center">
                    <Dialog.Root>
                      <Dialog.Trigger asChild>
                        <Icon size="lg" color="gray.400">
                          <FaPen />
                        </Icon>
                      </Dialog.Trigger>
                      <Portal>
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                          <Dialog.Content>
                            <Dialog.Header>
                              <Dialog.Title>編集登録</Dialog.Title>
                            </Dialog.Header>
                            {/* 入力エリア */}
                            <Dialog.Body>
                              <Field.Root required>
                                <Field.Label>
                                  学習内容 <Field.RequiredIndicator />
                                </Field.Label>
                                <Input onChange={onChengeInputText} type="text" id='text' value={inpuText} placeholder={record.title} />
                              </Field.Root>

                              <Field.Root>
                                <Field.Label>学習時間</Field.Label>
                                <NumberInput.Root required>
                                  <NumberInput.Control />
                                  <NumberInput.Input onChange={onChengeInputTime} id='time' value={inpuTime} placeholder={record.time} />
                                </NumberInput.Root>
                              </Field.Root>
                            </Dialog.Body>
                            <Dialog.Footer>
                              <Dialog.ActionTrigger asChild>
                                <Button variant="outline">キャンセル</Button>
                              </Dialog.ActionTrigger>
                              <Button bg="blue.fg" fontWeight="semibold">登録する</Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                              <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                          </Dialog.Content>
                        </Dialog.Positioner>
                      </Portal>
                    </Dialog.Root>
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    <button onClick={() => onClickDelete(record.id)}>
                      <Icon size="lg" color="gray.400">
                        <FaTrashAlt />
                      </Icon>
                    </button>
                  </Table.Cell>
                </Table.Row>
              )
            })}

          </Table.Body>
        </Table.Root>



      </div >

    </>
  )
}