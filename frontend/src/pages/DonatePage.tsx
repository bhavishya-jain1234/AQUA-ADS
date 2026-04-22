import { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { spawnWaterRipple } from '../effects/waterButtonRipple';

type Ngo = {
  id: string;
  name: string;
  upiId: string;
  note?: string;
};

const NGOS: Ngo[] = [
  {
    id: 'water-aid',
    name: 'WaterAid India (example)',
    upiId: 'wateraidindia@upi',
    note: 'Replace this with the NGO’s real UPI ID.',
  },
  {
    id: 'your-ngo',
    name: 'Your Partner NGO (example)',
    upiId: 'ngo@upi',
    note: 'Replace this with your partner NGO details.',
  },
];

function buildUpiDeepLink(params: {
  pa: string; // Payee VPA / UPI ID
  pn: string; // Payee name
  am: number; // Amount
  tn?: string; // Note
}): string {
  const url = new URL('upi://pay');
  url.searchParams.set('pa', params.pa);
  url.searchParams.set('pn', params.pn);
  url.searchParams.set('cu', 'INR');
  url.searchParams.set('am', params.am.toFixed(2));
  if (params.tn?.trim()) url.searchParams.set('tn', params.tn.trim());
  return url.toString();
}

const DonatePage = () => {
  const [selectedNgoId, setSelectedNgoId] = useState(NGOS[0]?.id ?? '');
  const [amountInput, setAmountInput] = useState('100');
  const [note, setNote] = useState('Donation via QR AQUA');
  const [copied, setCopied] = useState(false);

  const selectedNgo = useMemo(() => NGOS.find((n) => n.id === selectedNgoId) ?? NGOS[0], [selectedNgoId]);

  const amount = useMemo(() => {
    const n = Number(amountInput);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, n);
  }, [amountInput]);

  const upiLink = useMemo(() => {
    if (!selectedNgo || amount <= 0) return '';
    return buildUpiDeepLink({
      pa: selectedNgo.upiId,
      pn: selectedNgo.name,
      am: amount,
      tn: note,
    });
  }, [selectedNgo, amount, note]);

  const canPay = !!upiLink;

  const handleCopy = async () => {
    if (!upiLink) return;
    try {
      await navigator.clipboard.writeText(upiLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore; clipboard may be blocked on some browsers/contexts
    }
  };

  return (
    <div className="p-6 pb-24 h-full flex flex-col pt-12">
      <h1 className="text-3xl font-extrabold mb-2 drop-shadow-lg">Donate to an NGO</h1>
      <p className="text-sm text-gray-400 mb-6">
        This donation is paid <span className="font-bold text-white">directly to the NGO</span> using your UPI app. QR AQUA does not handle the money.
      </p>

      <div className="glass-card p-5 space-y-4">
        <div>
          <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Choose NGO</label>
          <select
            value={selectedNgoId}
            onChange={(e) => setSelectedNgoId(e.target.value)}
            className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {NGOS.map((ngo) => (
              <option key={ngo.id} value={ngo.id}>
                {ngo.name}
              </option>
            ))}
          </select>
          {selectedNgo?.note ? <p className="mt-2 text-xs text-amber-300/80">{selectedNgo.note}</p> : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Amount (INR)</label>
            <input
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="100"
              className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Note (optional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Donation via QR AQUA"
              className="mt-2 w-full bg-black/30 border border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[50, 100, 200, 500].map((v) => (
            <button
              key={v}
              type="button"
              onMouseDown={spawnWaterRipple}
              onClick={() => setAmountInput(String(v))}
              className="water-btn px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-bold"
            >
              ₹{v}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 glass-card p-6 text-center space-y-4">
        <h2 className="text-lg font-bold">Pay using UPI</h2>

        {canPay ? (
          <>
            <div className="bg-white p-4 rounded-xl inline-block mx-auto shadow-xl shadow-white/10">
              <QRCodeSVG value={upiLink} size={220} />
            </div>

            <div className="text-xs text-gray-400 break-all bg-black/30 border border-white/10 rounded-xl p-3">
              {upiLink}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                href={upiLink}
                onMouseDown={spawnWaterRipple}
                className="water-btn w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 text-center"
              >
                Open UPI App
              </a>
              <button
                type="button"
                onMouseDown={spawnWaterRipple}
                onClick={handleCopy}
                className="water-btn w-full bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-bold transition-all active:scale-95"
              >
                {copied ? 'Copied' : 'Copy UPI Link'}
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">Enter a valid amount to generate the donation QR.</p>
        )}
      </div>
    </div>
  );
};

export default DonatePage;

