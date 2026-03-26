import { useState } from 'react';
import { priceService } from '../api/priceService';

function PriceManager({ prices, setPrices }) {
    const [newItem, setNewItem] = useState({ name: '', price: '' });

    const handleAdd = () => {
        const updated = { ...prices, [newItem.name]: Number(newItem.price) };
        setPrices(updated);
        priceService.savePrices(updated);
        setNewItem({ name: '', price: '' });
    };

    return (
        <div className="card">
            <h2>💰 재료 원가 관리 (100g 기준)</h2>
            <div className="price-input-row">
                <input placeholder="재료명" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                <input type="number" placeholder="가격" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                <button onClick={handleAdd}>등록/수정</button>
            </div>
            <table className="price-table">
                <thead><tr><th>재료</th><th>가격</th><th>관리</th></tr></thead>
                <tbody>
                    {Object.entries(prices).map(([name, price]) => (
                        <tr key={name}>
                            <td>{name}</td>
                            <td>₩{price.toLocaleString()}</td>
                            <td><button onClick={() => {
                                const next = {...prices}; delete next[name];
                                setPrices(next); priceService.savePrices(next);
                            }}>삭제</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default PriceManager;