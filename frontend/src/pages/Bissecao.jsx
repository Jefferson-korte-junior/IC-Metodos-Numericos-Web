import React, { useState } from 'react';
import CardIteracaoBissecao from '../components/bisseccao/CardIteracaoBissecao';

function Bissecao() {
    const [funcao, setFuncao] = useState('x**2 - 4');
    const [a, setA] = useState(0);
    const [b, setB] = useState(3);
    const [criterio, setCriterio] = useState(0.0001);

    const [resultado, setResultado] = useState(null);
    const [erro, setErro] = useState(null);
    const [carregando, setCarregando] = useState(false);

    const handleCalcular = async () => {
        setCarregando(true);
        setErro(null);
        setResultado(null);

        try {
            const response = await fetch('http://127.0.0.1:8000/calcular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    funcao: funcao,
                    a: parseFloat(a),
                    b: parseFloat(b),
                    criterio: parseFloat(criterio)
                }),
            });

            const data = await response.json();

            if (data.erro) {
                setErro(data.erro);
            } else {
                setResultado(data);
            }
        } catch (err) {
            setErro("Não foi possível conectar ao backend. O uvicorn está rodando?");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px' }}>
            <h2>Método da Bisseção</h2>

            <div style={{ marginBottom: '10px' }}>
                <label>f(x): </label>
                <input type="text" value={funcao} onChange={(e) => setFuncao(e.target.value)} />
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label>Limite a: </label>
                <input type="number" value={a} onChange={(e) => setA(e.target.value)} />
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label>Limite b: </label>
                <input type="number" value={b} onChange={(e) => setB(e.target.value)} />
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label>Critério (Erro): </label>
                <input type="number" step="0.0001" value={criterio} onChange={(e) => setCriterio(e.target.value)} />
            </div>

            <button onClick={handleCalcular} disabled={carregando}>
                {carregando ? 'Calculando...' : 'Calcular'}
            </button>

            <hr />

            {erro && <p style={{ color: 'red' }}><strong>Erro:</strong> {erro}</p>}

            {resultado && (
                <div>
                    <p><strong>Raiz aproximada:</strong> {resultado.raiz.toFixed(6)}</p>
                    <p><strong>Total de iterações:</strong> {resultado.iteracoes.length}</p>

                    {/* Cards de iteração com gráficos */}
                    <CardIteracaoBissecao
                        iteracoes={resultado.iteracoes}
                        funcao={funcao}
                    />
                </div>
            )}
        </div>
    );
}

export default Bissecao;
