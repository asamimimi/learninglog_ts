import { useState, useEffect } from 'react'
import { useForm } from "react-hook-form";
import { createClient } from '@supabase/supabase-js';

// UI
import { Table } from "@chakra-ui/react"

import './App.css'
import RecordList, { type Recode } from './components/Recors';
import InputArea, { type FormValues } from './components/InputArea';
import EditArea from './components/EditArea';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);




export default function App() {

  // 学習記録
  const [records, setRecords] = useState<Recode[]>([])

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
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const onSubmit = async (data: FormValues) => {
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
  } = useForm<FormValues>();

  // 編集モーダルを開く（選択した行の値をフォームに入れる）
  const onClickEdit = (record: Recode) => {
    setEditingRecord(record);
    resetEdit({ title: record.title, time: record.time });
  };

  // 更新機能
  const onSubmitEdit = async (data: FormValues) => {
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
      {/* 登録エリア */}
      <InputArea
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        register={register}
        errors={errors}
      />

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
              <RecordList
                key={record.id}
                record={record}
                onClickDelete={onClickDelete}
                onClickEdit={onClickEdit}
              />
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



      <EditArea
        editingRecord={editingRecord}
        setEditingRecord={setEditingRecord}
        handleSubmitEdit={handleSubmitEdit}
        onSubmitEdit={onSubmitEdit}
        registerEdit={registerEdit}
        editErrors={editErrors}
      />

    </div >

  </>
  )
}