import React, { useState } from "react";

export default function Feedback() {
    const [tipo, setTipo] = useState("sugestao");
    const [mensagem, setMensagem] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState(null);

    async function enviarFeedback() {
        try {
            const res = await fetch("https://backend-termo.onrender.com/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo, mensagem, userEmail: email })
            });

            const data = await res.json();
            if (data.success) {
                setStatus({ ok: true, msg: "✅ Feedback enviado com sucesso!" });
                setMensagem("");
                setEmail("");
            } else {
                setStatus({ ok: false, msg: "❌ Erro ao enviar feedback" });
            }
        } catch (e) {
            setStatus({ ok: false, msg: "❌ Erro de conexão com servidor" });
        }
    }

    return (
        <div className="feedback-card">
            <h2>💬 Mande seu feedback</h2>

            <label>Tipo de feedback</label>
            <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
            >
                <option value="sugestao">💡 Sugestão de palavra</option>
                <option value="remocao">❌ Remover palavra errada</option>
                <option value="bug">🐞 Reportar bug</option>
            </select>

            <label>Sua mensagem</label>
            <textarea
                placeholder="Escreva aqui..."
                value={mensagem}
                onChange={e => setMensagem(e.target.value)}
            />

            <label>E-mail (opcional)</label>
            <input
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />

            <button onClick={enviarFeedback}>Enviar</button>

            {status && (
                <p className={status.ok ? "msg ok" : "msg error"}>
                    {status.msg}
                </p>
            )}
        </div>
    );
}
