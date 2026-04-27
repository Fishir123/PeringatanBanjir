import { predictions, confusionMatrix, statusLabels } from '@/data/dummy-data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BrainCircuit, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
const badgeClass = {
    safe: 'status-badge-safe',
    alert: 'status-badge-alert',
    danger: 'status-badge-danger',
  warning: 'status-badge-alert',
};
const PredictionPage = () => {
    const latest = predictions[predictions.length - 1];
    const chartData = predictions.map(p => ({
        time: new Date(p.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        actual: p.actual,
        predicted: p.predicted,
    }));
    const handleRetrain = () => {
        Swal.fire({
            title: 'Retrain Model?',
            text: 'Proses retraining akan memakan waktu beberapa menit.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'hsl(142, 72%, 29%)',
            confirmButtonText: 'Ya, Retrain!',
            cancelButtonText: 'Batal',
            background: 'hsl(222, 25%, 12%)',
            color: 'hsl(210, 20%, 92%)',
        }).then(result => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'Berhasil!', text: 'Model telah di-retrain (simulasi).', icon: 'success', background: 'hsl(222, 25%, 12%)', color: 'hsl(210, 20%, 92%)', confirmButtonColor: 'hsl(142, 72%, 29%)' });
            }
        });
    };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-card-foreground">🧠 Prediksi Machine Learning</h2>
        <button onClick={handleRetrain} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
          <RefreshCw className="w-4 h-4"/> Retrain Model
        </button>
      </div>

      {/* Latest prediction */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="flood-card text-center">
          <BrainCircuit className="w-8 h-8 text-primary mx-auto mb-2"/>
          <p className="text-xs text-muted-foreground">Prediksi Terbaru</p>
          <p className="text-2xl font-bold text-card-foreground">{latest.predicted.toFixed(1)} cm</p>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[11px] font-semibold ${badgeClass[latest.status] || 'status-badge-alert'}`}>
            {statusLabels[latest.status] || statusLabels.alert}
          </span>
        </div>
        <div className="flood-card text-center">
          <p className="text-xs text-muted-foreground">Nilai Aktual</p>
          <p className="text-2xl font-bold text-card-foreground mt-3">{latest.actual.toFixed(1)} cm</p>
          <p className="text-xs text-muted-foreground mt-2">Selisih: {Math.abs(latest.actual - latest.predicted).toFixed(1)} cm</p>
        </div>
        <div className="flood-card text-center">
          <p className="text-xs text-muted-foreground">Confidence Level</p>
          <p className="text-2xl font-bold text-primary mt-3">{latest.confidence.toFixed(1)}%</p>
          <div className="w-full bg-muted rounded-full h-2.5 mt-3">
            <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${latest.confidence}%` }}/>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flood-card">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">📈 Actual vs Prediction</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}/>
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}/>
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--card-foreground))' }}/>
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="hsl(var(--status-alert))" strokeWidth={2} dot={false} name="Aktual"/>
            <Line type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Prediksi" strokeDasharray="5 5"/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Confusion Matrix */}
      <div className="flood-card">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">🔢 Confusion Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full max-w-lg mx-auto text-sm text-center">
            <thead>
              <tr>
                <th className="p-2 text-muted-foreground"></th>
                {confusionMatrix.labels.map(l => (<th key={l} className="p-2 text-muted-foreground font-medium">{l}</th>))}
              </tr>
            </thead>
            <tbody>
              {confusionMatrix.data.map((row, i) => (<tr key={i}>
                  <td className="p-2 font-medium text-card-foreground">{confusionMatrix.labels[i]}</td>
                  {row.map((val, j) => (<td key={j} className={`p-2 rounded ${i === j ? 'bg-primary/20 text-primary font-bold' : 'text-muted-foreground'}`}>
                      {val}
                    </td>))}
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
};
export default PredictionPage;
