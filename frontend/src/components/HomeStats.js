import React from 'react';
import db from '../data/db.json';
import '../styles/components/HomeStats.scss';

const HomeStats = () => {
    const { total_jobs, total_companies, total_industries } = db.stats;

    return (
        <div className="home-stats-container">
            <div className="stat-item">
                <span className="stat-number">{total_jobs.toLocaleString('vi-VN')}</span>
                <span className="stat-label">Việc làm</span>
            </div>
            <div className="stat-item">
                <span className="stat-number">{total_companies.toLocaleString('vi-VN')}</span>
                <span className="stat-label">Công ty</span>
            </div>
            <div className="stat-item">
                <span className="stat-number">{total_industries.toLocaleString('vi-VN')}</span>
                <span className="stat-label">Ngành nghề</span>
            </div>
        </div>
    );
};

export default HomeStats;
