'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { filterColleges } from '@/lib/api';
import { CollegeEntry, FilterRequest } from '@/lib/types';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, PointElement, LinearScale, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(PointElement, LinearScale, Title, Tooltip, Legend);

export default function FilterForm() {
  const { getToken } = useAuth();
  const [filter, setFilter] = useState<FilterRequest>({
    exams: [],
    ranks: {},
    min_average_placement: undefined,
    min_median_placement: undefined,
    min_highest_placement: undefined,
    sort_by: 'cutoff_rank_asc',
  });
  const [results, setResults] = useState<CollegeEntry[]>([]);
  const [displayedResults, setDisplayedResults] = useState<CollegeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  const availableExams = ['JEE Main', 'JEE Advanced', 'WBJEE', 'BITSAT', 'VITEEE'];

  const handleExamToggle = (exam: string) => {
    if (filter.exams.includes(exam)) {
      const newExams = filter.exams.filter((e) => e !== exam);
      const newRanks = { ...filter.ranks };
      delete newRanks[exam];
      setFilter({ ...filter, exams: newExams, ranks: newRanks });
    } else {
      setFilter({
        ...filter,
        exams: [...filter.exams, exam],
        ranks: { ...filter.ranks, [exam]: 0 },
      });
    }
  };

  const handleRankChange = (exam: string, value: string) => {
    const rank = parseInt(value);
    if (!isNaN(rank)) {
      setFilter({ ...filter, ranks: { ...filter.ranks, [exam]: rank } });
    }
  };

  const handlePlacementChange = (field: keyof FilterRequest, value: string) => {
    const num = parseInt(value);
    setFilter({ ...filter, [field]: isNaN(num) ? undefined : num });
  };

  const sortResults = (results: CollegeEntry[], sortBy: string) => {
    const sorted = [...results];
    switch (sortBy) {
      case 'cutoff_rank_asc':
        return sorted.sort((a, b) => a.cutoff_rank - b.cutoff_rank);
      case 'average_placement_desc':
        return sorted.sort((a, b) => (b.average_placement || 0) - (a.average_placement || 0));
      case 'median_placement_desc':
        return sorted.sort((a, b) => (b.median_placement || 0) - (a.median_placement || 0));
      case 'highest_placement_desc':
        return sorted.sort((a, b) => (b.highest_placement || 0) - (a.highest_placement || 0));
      default:
        return sorted;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (filter.exams.length === 0) {
      setError('Please select at least one exam.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const token = await getToken();
      console.log('Filter request:', filter, 'Token:', token);
      const filteredResults = await filterColleges(filter, token);
      console.log('Filtered results:', filteredResults);
      const sortedResults = sortResults(filteredResults, filter.sort_by || 'cutoff_rank_asc');
      setResults(sortedResults);
      setDisplayedResults(sortedResults.slice(0, 10));
      setShowAll(false);
    } catch (err: any) {
      setError('Failed to fetch colleges. Please try again.');
      console.error('Filter error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (sortBy: string) => {
    setFilter({ ...filter, sort_by: sortBy });
    const sortedResults = sortResults(results, sortBy);
    setResults(sortedResults);
    setDisplayedResults(sortedResults.slice(0, showAll ? sortedResults.length : 10));
  };

  const handleShowMore = () => {
    setShowAll(true);
    setDisplayedResults(results);
  };

  // Chart data preparation
  const topColleges = displayedResults.slice(0, 10);
  console.log('Top colleges for charts:', topColleges);
  const labels = topColleges.map((c, i) => `${c.college} (${c.branch})`);

  const averageSalaryData = {
    datasets: [
      {
        label: 'Average Salary (LPA)',
        data: topColleges.map((c, i) => ({ x: i, y: c.average_placement || 0 })),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        pointRadius: 6,
        pointHoverRadius: 10,
      },
    ],
  };

  const medianSalaryData = {
    datasets: [
      {
        label: 'Median Salary (LPA)',
        data: topColleges.map((c, i) => ({ x: i, y: c.median_placement || 0 })),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        pointRadius: 6,
        pointHoverRadius: 10,
      },
    ],
  };

  const highestSalaryData = {
    datasets: [
      {
        label: 'Highest Salary (LPA)',
        data: topColleges.map((c, i) => ({ x: i, y: c.highest_placement || 0 })),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        pointRadius: 6,
        pointHoverRadius: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '' },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any[]) => labels[tooltipItems[0].dataIndex] || '',
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        display: false,
        min: -0.5,
        max: topColleges.length - 0.5,
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Salary (LPA)' },
      },
    },
  };

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-lg font-medium">Select Exams:</label>
          <div className="flex space-x-4">
            {availableExams.map((exam) => (
              <label key={exam} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filter.exams.includes(exam)}
                  onChange={() => handleExamToggle(exam)}
                  className="mr-2"
                />
                {exam}
              </label>
            ))}
          </div>
        </div>
        {filter.exams.map((exam) => (
          <div key={exam}>
            <label className="block text-lg font-medium">{`${exam} Rank:`}</label>
            <input
              type="number"
              value={filter.ranks[exam] || ''}
              onChange={(e) => handleRankChange(exam, e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder={`Enter your ${exam} rank`}
              min="0"
              step="1"
            />
          </div>
        ))}
        <div>
          <label className="block text-lg font-medium">Min Average Placement (LPA):</label>
          <input
            type="number"
            value={filter.min_average_placement || ''}
            onChange={(e) => handlePlacementChange('min_average_placement', e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter minimum average placement"
            min="0"
            step="1"
          />
        </div>
        <div>
          <label className="block text-lg font-medium">Min Median Placement (LPA):</label>
          <input
            type="number"
            value={filter.min_median_placement || ''}
            onChange={(e) => handlePlacementChange('min_median_placement', e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter minimum median placement"
            min="0"
            step="1"
          />
        </div>
        <div>
          <label className="block text-lg font-medium">Min Highest Placement (LPA):</label>
          <input
            type="number"
            value={filter.min_highest_placement || ''}
            onChange={(e) => handlePlacementChange('min_highest_placement', e.target.value)}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter minimum highest placement"
            min="0"
            step="1"
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          disabled={isLoading || filter.exams.length === 0}
        >
          {isLoading ? 'Loading...' : 'Filter Colleges'}
        </button>
      </form>
      <div className="mt-4">
        <label className="block text-lg font-medium">Sort By:</label>
        <select
          value={filter.sort_by}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="cutoff_rank_asc">Cutoff Rank (Low to High)</option>
          <option value="average_placement_desc">Average Placement (High to Low)</option>
          <option value="median_placement_desc">Median Placement (High to Low)</option>
          <option value="highest_placement_desc">Highest Placement (High to Low)</option>
        </select>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {displayedResults.length > 0 ? (
        <div className="mt-6">
          <h2 className="text-xl font-bold">Eligible Colleges</h2>
          <ul className="mt-2 space-y-2">
            {displayedResults.map((college, index) => (
              <li key={index} className="p-2 border rounded-lg">
                <p><strong>Exam:</strong> {college.exam}</p>
                <p><strong>College:</strong> {college.college}</p>
                <p><strong>Branch:</strong> {college.branch}</p>
                <p><strong>Cutoff Rank:</strong> {college.cutoff_rank}</p>
                <p><strong>Average Placement:</strong> {college.average_placement ? `${college.average_placement} LPA` : 'N/A'}</p>
                <p><strong>Median Placement:</strong> {college.median_placement ? `${college.median_placement} LPA` : 'N/A'}</p>
                <p><strong>Highest Placement:</strong> {college.highest_placement ? `${college.highest_placement} LPA` : 'N/A'}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !isLoading && <p className="mt-4">No colleges found.</p>
      )}
      {!showAll && results.length > 10 && (
        <button
          onClick={handleShowMore}
          className="mt-4 p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Show More
        </button>
      )}
      {topColleges.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Salary Visualizations (Top {topColleges.length} Colleges)</h2>
          <div className="grid grid-cols-1 gap-8">
            <div className="w-full h-[400px]">
              <h3 className="text-lg font-medium mb-2">Average Salary</h3>
              <Scatter
                data={averageSalaryData}
                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Average Salary (LPA)' } } }}
              />
            </div>
            <div className="w-full h-[400px]">
              <h3 className="text-lg font-medium mb-2">Median Salary</h3>
              <Scatter
                data={medianSalaryData}
                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Median Salary (LPA)' } } }}
              />
            </div>
            <div className="w-full h-[400px]">
              <h3 className="text-lg font-medium mb-2">Highest Salary</h3>
              <Scatter
                data={highestSalaryData}
                options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Highest Salary (LPA)' } } }}
              />
            </div>
          </div>
        </div>
      ) : (
        displayedResults.length === 0 && !isLoading && (
          <p className="mt-8 text-gray-500">No salary data available for visualization.</p>
        )
      )}
    </div>
  );
}