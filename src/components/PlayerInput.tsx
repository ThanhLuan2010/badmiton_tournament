import React, { useState } from 'react';

interface PlayerInputProps {
    onGenerate: (males: string[], females: string[]) => void;
}

const PlayerInput: React.FC<PlayerInputProps> = ({ onGenerate }) => {
    const [maleText, setMaleText] = useState('');
    const [femaleText, setFemaleText] = useState('');

    const handleGenerate = () => {
        const males = maleText.split('\n').filter(s => s.trim().length > 0);
        const females = femaleText.split('\n').filter(s => s.trim().length > 0);
        onGenerate(males, females);
    };

    return (
        <div className="input-section">
            <div className="input-group">
                <label htmlFor="male-input">Nam (Mỗi dòng 1 tên)</label>
                <textarea
                    id="male-input"
                    placeholder="Nhập tên các bạn nam..."
                    value={maleText}
                    onChange={(e) => setMaleText(e.target.value)}
                />
                <small style={{ color: 'var(--text-muted)' }}>Số lượng: {maleText.split('\n').filter(s => s.trim()).length}</small>
            </div>

            <div className="input-group">
                <label htmlFor="female-input">Nữ (Mỗi dòng 1 tên)</label>
                <textarea
                    id="female-input"
                    placeholder="Nhập tên các bạn nữ..."
                    value={femaleText}
                    onChange={(e) => setFemaleText(e.target.value)}
                />
                <small style={{ color: 'var(--text-muted)' }}>Số lượng: {femaleText.split('\n').filter(s => s.trim()).length}</small>
            </div>

            <div style={{ gridColumn: '1 / -1' }} className="actions">
                <button className="btn-primary" onClick={handleGenerate}>
                    Tạo Nhóm Ngẫu Nhiên
                </button>
            </div>
        </div>
    );
};

export default PlayerInput;
