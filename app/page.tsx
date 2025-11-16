'use client'

import React, { useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import Image from 'next/image'

interface Venda {
  id: string
  data: string
  valor: number
  peca: string
}

interface Fiado {
  id: string
  cliente: string
  valor: number
  data: string
}

export default function Home() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [fiados, setFiados] = useState<Fiado[]>([])
  const [novaVenda, setNovaVenda] = useState({ valor: '', peca: '' })
  const [novoFiado, setNovoFiado] = useState({ cliente: '', valor: '' })
  const [activeTab, setActiveTab] = useState('vendas')

  useEffect(() => {
    const vendasSalvas = localStorage.getItem('vendas_shaday')
    const finadosSalvos = localStorage.getItem('fiados_shaday')
    if (vendasSalvas) setVendas(JSON.parse(vendasSalvas))
    if (finadosSalvos) setFiados(JSON.parse(finadosSalvos))
  }, [])

  const adicionarVenda = () => {
    if (!novaVenda.valor || !novaVenda.peca) return
    const venda: Venda = {
      id: Date.now().toString(),
      data: new Date().toLocaleDateString('pt-BR'),
      valor: parseFloat(novaVenda.valor),
      peca: novaVenda.peca,
    }
    const novasVendas = [...vendas, venda]
    setVendas(novasVendas)
    localStorage.setItem('vendas_shaday', JSON.stringify(novasVendas))
    setNovaVenda({ valor: '', peca: '' })
  }

  const adicionarFiado = () => {
    if (!novoFiado.cliente || !novoFiado.valor) return
    const fiado: Fiado = {
      id: Date.now().toString(),
      cliente: novoFiado.cliente,
      valor: parseFloat(novoFiado.valor),
      data: new Date().toLocaleDateString('pt-BR'),
    }
    const novosFiados = [...fiados, fiado]
    setFiados(novosFiados)
    localStorage.setItem('fiados_shaday', JSON.stringify(novosFiados))
    setNovoFiado({ cliente: '', valor: '' })
  }

  const deletarVenda = (id: string) => {
    const novasVendas = vendas.filter((v) => v.id !== id)
    setVendas(novasVendas)
    localStorage.setItem('vendas_shaday', JSON.stringify(novasVendas))
  }

  const deletarFiado = (id: string) => {
    const novosFiados = fiados.filter((f) => f.id !== id)
    setFiados(novosFiados)
    localStorage.setItem('fiados_shaday', JSON.stringify(novosFiados))
  }

  const totalVendas = vendas.reduce((acc, v) => acc + v.valor, 0)
  const totalFiados = fiados.reduce((acc, f) => acc + f.valor, 0)

  const gerarPDF = async () => {
    const elemento = document.getElementById('relatorio')
    if (!elemento) return

    const canvas = await html2canvas(elemento, { scale: 2, backgroundColor: '#ffffff' })
    const img = canvas.toDataURL('image/png')

    const pdf = new jsPDF('p', 'mm', 'a4')
    const largura = pdf.internal.pageSize.getWidth()
    const altura = pdf.internal.pageSize.getHeight()

    pdf.addImage(img, 'PNG', 0, 0, largura, altura)
    pdf.save(`relatorio_shaday_${new Date().toLocaleDateString('pt-BR')}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50">
      {/* Header Animado */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-pink-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image 
              src="/images/shaday.jpg" 
              alt="Shaday Store Logo" 
              width={80}
              height={80}
              className="object-contain"
              priority
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                Shaday Store
              </h1>
              <p className="text-sm text-pink-500 font-semibold">Relatório de Vendas</p>
            </div>
          </div>
          <button
            onClick={gerarPDF}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 transform"
          >
            📄 Gerar PDF
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-l-4 border-green-500 animate-slideIn">
            <p className="text-gray-600 text-sm font-semibold">Total de Vendas</p>
            <h2 className="text-4xl font-bold text-green-600 mt-2">
              R$ {totalVendas.toFixed(2)}
            </h2>
            <p className="text-gray-500 text-xs mt-2">{vendas.length} transações</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-l-4 border-orange-500 animate-slideIn" style={{ animationDelay: '100ms' }}>
            <p className="text-gray-600 text-sm font-semibold">Total a Receber</p>
            <h2 className="text-4xl font-bold text-orange-600 mt-2">
              R$ {totalFiados.toFixed(2)}
            </h2>
            <p className="text-gray-500 text-xs mt-2">{fiados.length} clientes</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-l-4 border-blue-500 animate-slideIn" style={{ animationDelay: '200ms' }}>
            <p className="text-gray-600 text-sm font-semibold">Total Geral</p>
            <h2 className="text-4xl font-bold text-blue-600 mt-2">
              R$ {(totalVendas + totalFiados).toFixed(2)}
            </h2>
            <p className="text-gray-500 text-xs mt-2">Vendas + Fiados</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-pink-200">
          <button
            onClick={() => setActiveTab('vendas')}
            className={`px-6 py-3 font-semibold transition-all duration-300 ${
              activeTab === 'vendas'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-600 hover:text-pink-600'
            }`}
          >
            💰 Vendas
          </button>
          <button
            onClick={() => setActiveTab('fiados')}
            className={`px-6 py-3 font-semibold transition-all duration-300 ${
              activeTab === 'fiados'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-600 hover:text-pink-600'
            }`}
          >
            📋 Fiados
          </button>
        </div>

        {/* Seção de Vendas */}
        {activeTab === 'vendas' && (
          <div className="space-y-6 animate-slideIn">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Adicionar Venda</h3>
              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="Nome da peça (ex: Blusa, Calça, Vestido)"
                  value={novaVenda.peca}
                  onChange={(e) => setNovaVenda({ ...novaVenda, peca: e.target.value })}
                  className="flex-1 min-w-40 px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                />
                <input
                  type="number"
                  placeholder="Valor da venda (R$)"
                  value={novaVenda.valor}
                  onChange={(e) => setNovaVenda({ ...novaVenda, valor: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && adicionarVenda()}
                  className="flex-1 min-w-40 px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  step="0.01"
                />
                <button
                  onClick={adicionarVenda}
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Data</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Peça</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Valor</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  {vendas.length > 0 ? (
                    vendas.map((venda, idx) => (
                      <tr
                        key={venda.id}
                        className="hover:bg-pink-50 transition-colors duration-200 animate-slideIn"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <td className="px-6 py-4 text-gray-700">{venda.data}</td>
                        <td className="px-6 py-4 text-gray-700 font-semibold">{venda.peca}</td>
                        <td className="px-6 py-4 font-bold text-green-600">
                          R$ {venda.valor.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => deletarVenda(venda.id)}
                            className="text-red-500 hover:text-red-700 font-bold transition-colors hover:scale-125"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        Nenhuma venda registrada ainda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Seção de Fiados */}
        {activeTab === 'fiados' && (
          <div className="space-y-6 animate-slideIn">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Adicionar Fiado</h3>
              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="Nome do cliente"
                  value={novoFiado.cliente}
                  onChange={(e) => setNovoFiado({ ...novoFiado, cliente: e.target.value })}
                  className="flex-1 min-w-40 px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
                <input
                  type="number"
                  placeholder="Valor (R$)"
                  value={novoFiado.valor}
                  onChange={(e) => setNovoFiado({ ...novoFiado, valor: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && adicionarFiado()}
                  className="flex-1 min-w-40 px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  step="0.01"
                />
                <button
                  onClick={adicionarFiado}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Adicionar
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-500 to-rose-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Cliente</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Valor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Data</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100">
                  {fiados.length > 0 ? (
                    fiados.map((fiado, idx) => (
                      <tr
                        key={fiado.id}
                        className="hover:bg-orange-50 transition-colors duration-200 animate-slideIn"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <td className="px-6 py-4 text-gray-700 font-semibold">{fiado.cliente}</td>
                        <td className="px-6 py-4 font-bold text-orange-600">
                          R$ {fiado.valor.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{fiado.data}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => deletarFiado(fiado.id)}
                            className="text-red-500 hover:text-red-700 font-bold transition-colors hover:scale-125"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        Nenhum fiado registrado ainda
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Relatório Oculto para PDF */}
        <div
          id="relatorio"
          className="hidden p-8 bg-white"
          style={{ width: '210mm', height: '297mm' }}
        >
          <div className="text-center mb-8">
            <Image 
              src="/images/shaday.jpg" 
              alt="Shaday Store Logo" 
              width={100}
              height={100}
              className="mx-auto mb-4 object-contain"
            />
            <h1 className="text-3xl font-bold text-pink-600">SHADAY STORE</h1>
            <p className="text-gray-600 text-lg">Relatório de Vendas</p>
            <p className="text-sm text-gray-500 mt-2">
              Gerado em: {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-pink-300">Resumo Financeiro</h2>
            <table className="w-full border-collapse text-lg">
              <tbody>
                <tr className="border-b border-pink-200">
                  <td className="p-3 font-semibold text-gray-700">Total de Vendas:</td>
                  <td className="p-3 text-right font-bold text-green-600">R$ {totalVendas.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-orange-200">
                  <td className="p-3 font-semibold text-gray-700">Total a Receber:</td>
                  <td className="p-3 text-right font-bold text-orange-600">R$ {totalFiados.toFixed(2)}</td>
                </tr>
                <tr className="bg-pink-50">
                  <td className="p-3 font-bold text-gray-800">TOTAL GERAL:</td>
                  <td className="p-3 text-right font-bold text-lg text-pink-600">
                    R$ {(totalVendas + totalFiados).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {vendas.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-300">Vendas Realizadas</h2>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-pink-100 border-b">
                    <th className="border p-2 text-left font-semibold">Data</th>
                    <th className="border p-2 text-left font-semibold">Peça</th>
                    <th className="border p-2 text-right font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((v, idx) => (
                    <tr key={v.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-pink-50'}>
                      <td className="border p-2">{v.data}</td>
                      <td className="border p-2">{v.peca}</td>
                      <td className="border p-2 text-right font-semibold">R$ {v.valor.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-pink-100 border-t-2">
                    <td className="border p-2" colSpan={2}>TOTAL</td>
                    <td className="border p-2 text-right">R$ {totalVendas.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {fiados.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-orange-300">Pendências (Fiados)</h2>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-orange-100 border-b">
                    <th className="border p-2 text-left font-semibold">Cliente</th>
                    <th className="border p-2 text-left font-semibold">Data</th>
                    <th className="border p-2 text-right font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {fiados.map((f, idx) => (
                    <tr key={f.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-orange-50'}>
                      <td className="border p-2">{f.cliente}</td>
                      <td className="border p-2">{f.data}</td>
                      <td className="border p-2 text-right font-semibold">R$ {f.valor.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-orange-100 border-t-2">
                    <td className="border p-2" colSpan={2}>TOTAL A RECEBER</td>
                    <td className="border p-2 text-right">R$ {totalFiados.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
