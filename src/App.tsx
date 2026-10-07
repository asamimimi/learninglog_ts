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

  // 合計時間
  const totalTime = records.reduce((sum, content) => {
    // 文字列として扱われないよう、Number()で数値に変換
    return sum + Number(content.time);
  }, 0); // 0 は初期値（sumの最初の値）



  // モーダルの開閉
  const [isOpen, setIsOpen] = useState(false);

  // ローデイング管理
  const [isLoading, setIsLoading] = useState(false);


  // ページ読み込み時のデータ取得
  useEffect(() => {
    async function fetchRecords() {
      setIsLoading(true); // ①読み込み開始！
      const { data, error } = await supabase.from('study-record').select()
      if (error) {
        console.error(error)
        return
      }
      if (data) {
        setRecords(data)
      }
      setIsLoading(false);
    }
    fetchRecords()
  }, [])



  // 登録時データ取得用の関数
  const fetchData = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('study-record').select("*");
    if (error) {
      console.error("データ取得エラー:", error);
      return;
    }
    setRecords(data);
    setIsLoading(false);
  };


  // フォーム管理・データ登録
  const { register, handleSubmit, formState: { errors } } = useForm<{ title: string, time: number }>();
  const onSubmit = async (data: Recode) => {
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
  // 編集中のレコード（nullなら編集モーダルは閉じている）
  const [editingRecord, setEditingRecord] = useState<Recode | null>(null);

  // 編集用フォーム（新規登録フォームとは別に管理する）
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<{ title: string, time: number }>();

  // 編集モーダルを開く（選択した行の値をフォームに入れる）
  const onClickEdit = (record: Recode) => {
    setEditingRecord(record);
    resetEdit({ title: record.title, time: record.time });
  };

  // 更新機能
  const onSubmitEdit = async (data: { title: string, time: number }) => {
    if (!editingRecord) return;
    const { error } = await supabase
      .from('study-record')
      .update({
        title: data.title,
        time: data.time,
      })
      .eq('id', editingRecord.id);
    if (error) {
      console.error("データ更新エラー:", error);
      return;
    }
    // 更新成功時のみモーダルを閉じる
    setEditingRecord(null);
    await fetchData();
  };
  return (<>
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
      {
        isLoading ?
          (
            <div>
              Loading...
            </div>
          ) : null
      }

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
                  {/* 編集画面オープンのトリガーアイコン */}
                  <button onClick={() => onClickEdit(record)} className='btn'>
                    <Icon size="lg" color="gray.400">
                      <FaPen />
                    </Icon>
                  </button>
                </Table.Cell>
                <Table.Cell textAlign="center">
                  <button onClick={() => onClickDelete(record.id)} className='btn'>
                    <Icon size="lg" color="gray.400">
                      <FaTrashAlt />
                    </Icon>
                  </button>
                </Table.Cell>
              </Table.Row>
            )
          })}

        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.Cell>合計時間：</Table.Cell>
            <Table.Cell>{totalTime}時間</Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table.Root>

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



    </div >

  </>
  )
}