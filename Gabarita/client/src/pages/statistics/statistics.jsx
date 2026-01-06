// client/src/pages/statistics/Statistics.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineArrowLeft } from 'react-icons/ai';
// NOVO: Adicionei componentes do BarChart
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { SlChemistry } from "react-icons/sl";
import { BiWorld } from "react-icons/bi";
import { TbMathFunction } from "react-icons/tb";
import { IoBookOutline } from "react-icons/io5";

import './statistics.css';

const Statistics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const subjectsMap = [
        { key: 'totalNatureza', scoreKey: 'scoreNatureza', label: 'Natureza', icon: <SlChemistry size={20} color="#E8BA35" /> },
        { key: 'totalMatematica', scoreKey: 'scoreMatematica', label: 'Matemática', icon: <TbMathFunction size={20} color="#E55656" /> },
        { key: 'totalHumanas', scoreKey: 'scoreHumanas', label: 'Humanas', icon: <BiWorld size={20} color="#5B4D9D" /> },
        { key: 'totalLinguagens', scoreKey: 'scoreLinguagens', label: 'Linguagens', icon: <IoBookOutline size={20} color="#D268CC" /> },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            try {
                // ATENÇÃO: Garanta que a URL está correta com o que definimos no answers.js
                const response = await fetch(`http://localhost:5000/api/answers/statistics/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Erro ao carregar estatísticas", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // 1. Dados para o Donut (Geral)
    const totalAnswered = stats?.questionsDone || 0;
    const totalCorrect = stats?.questionsRight || 0;
    const percentage = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const pieData = [
        { name: 'Acertos', value: totalCorrect, color: '#4B2C84' },
        { name: 'Erros', value: totalAnswered - totalCorrect, color: '#E0E0E0' },
    ];

    // NOVO: 2. Preparação dos dados para o Gráfico de Barras (Desempenho por Matéria)
    const performanceData = stats ? subjectsMap.map(subject => {
        const total = stats[subject.key] || 0;
        const acertos = stats[subject.scoreKey] || 0;
        const erros = total - acertos;

        return {
            name: subject.label, // Nome no eixo X
            Acertos: acertos,
            Erros: erros
        };
    }) : [];

    if (loading) return <div className="stats-loading">Carregando estatísticas...</div>;

    return (
        <div className="stats-container">
            <header className="stats-header">
                <Link to="/home" className="back-link">
                    <AiOutlineArrowLeft size={20} /> Voltar para a comunidade
                </Link>
                <h1>Estatísticas</h1>
            </header>

            <div className="stats-grid">

                {/* CARD 1: Lista Simples */}
                <div className="stats-card">
                    <h3>Total de questões por matéria</h3>
                    <div className="subjects-list">
                        {subjectsMap.map((subject) => {
                            const count = stats ? stats[subject.key] || 0 : 0;
                            return (
                                <div key={subject.key} className="subject-item">
                                    <div className="subject-info">
                                        <div className="subject-icon-wrapper">{subject.icon}</div>
                                        <span className="subject-name">{subject.label}</span>
                                    </div>
                                    <span className="subject-count">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CARD 2: Donut Chart */}
                <div className="stats-card chart-card">
                    <h3>Porcentagem de acertos (Geral)</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="chart-percentage-text">
                                    {percentage}%
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* NOVO CARD 3: Gráfico de Barras (Acertos vs Erros) */}
                <div className="stats-card full-width-card">
                    <h3>Desempenho detalhado por área</h3>
                    <div className="bar-chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={performanceData}
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                                {/* --- AQUI ESTÁ A MUDANÇA --- */}
                                <CartesianGrid
                                    strokeDasharray="4 4"
                                    vertical={true}  /* Ativa linhas verticais */
                                    stroke="#d0d0d0" /* Cor mais escura para visibilidade */
                                />
                                {/* --------------------------- */}

                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#666' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }} /* Efeito leve ao passar o mouse */
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />

                                <Bar dataKey="Acertos" fill="#4B2C84" radius={[4, 4, 0, 0]} barSize={40} />
                                <Bar dataKey="Erros" fill="#E55656" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Statistics;