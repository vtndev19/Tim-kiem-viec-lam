import React from "react";
import '../styles/components/Homesearch.scss';

export default function HomeSearch({ keyword, setKeyword }) {
    return (
        <div className="search-bar container">
            <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm theo từ khóa..."
            />
            <button className="search-bar__button">Tìm kiếm</button>
        </div>
    );
}
