// 'use client';

// import { useState, useEffect } from 'react';
// import { useAuth } from '@clerk/nextjs';
// import { filterColleges } from '@/lib/api';
// import { FilterRequest, CollegeEntry } from '@/lib/types';

// export default function FilterPage() {
//   const { userId, getToken, isLoaded } = useAuth();
//   const [filter, setFilter] = useState<FilterRequest>({
//     exams: [],
//     ranks: {},
//     sort_by: 'cutoff_rank_asc',
//     limit: 10,
//   });
//   const [colleges, setColleges] = useState<CollegeEntry[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [showAll, setShowAll] = useState(false);

//   const exams = ['JEE Main', 'JEE Advanced', 'WBJEE', 'VITEEE', 'BITSAT'];

//   const handleFilter = async () => {
//     console.log('handleFilter called with filter:', filter);
//     if (!filter.exams.length || !Object.keys(filter.ranks).length) {
//       setError('Please select at least one exam and enter ranks.');
//       console.log('Validation failed: exams or ranks empty');
//       return;
//     }
//     setError(null);
//     try {
//       const token = await getToken();
//       console.log('Clerk token:', token);
//       if (!token) {
//         setError('Authentication token missing. Please sign in again.');
//         console.log('No token received');
//         return;
//       }
//       const results = await filterColleges({ ...filter, limit: showAll ? 0 : 10 }, token);
//       console.log('API response:', results);
//       setColleges(results);
//     } catch (err: any) {
//       const errorMessage = `Failed to filter colleges: ${err.message}`;
//       setError(errorMessage);
//       console.error('Filter error:', err);
//     }
//   };

//   const handleShowMore = () => {
//     console.log('handleShowMore called');
//     setShowAll(true);
//     setFilter((prev) => ({ ...prev, limit: 0 }));
//     handleFilter();
//   };

//   useEffect(() => {
//     console.log('useEffect triggered, sort_by:', filter.sort_by, 'showAll:', showAll);
//     if (filter.exams.length && Object.keys(filter.ranks).length) {
//       handleFilter();
//     }
//   }, [filter.sort_by, showAll]);

//   if (!isLoaded) return <div>Loading...</div>;
//   if (!userId) return <div>Please sign in to use the filter.</div>;

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">College Filter</h1>
//       <div className="mb-4 p-4 border rounded-lg">
//         <div className="mb-4">
//           <label className="block mb-2 font-medium">Exams:</label>
//           {exams.map((exam) => (
//             <label key={exam} className="inline-flex items-center mr-4">
//               <input
//                 type="checkbox"
//                 value={exam}
//                 checked={filter.exams.includes(exam)}
//                 onChange={(e) => {
//                   const checked = e.target.checked;
//                   console.log(`Checkbox ${exam} changed to:`, checked);
//                   setFilter((prev) => {
//                     const newExams = checked
//                       ? [...prev.exams, exam]
//                       : prev.exams.filter((e) => e !== exam);
//                     const newRanks: { [key: string]: number } = { ...prev.ranks };
//                     if (checked) {
//                       newRanks[exam] = prev.ranks[exam] || 0;
//                     } else {
//                       delete newRanks[exam];
//                     }
//                     return {
//                       ...prev,
//                       exams: newExams,
//                       ranks: newRanks,
//                     };
//                   });
//                 }}
//                 className="mr-2"
//               />
//               {exam}
//             </label>
//           ))}
//         </div>
//         <div className="mb-4">
//           <label className="block mb-2 font-medium">Ranks:</label>
//           {filter.exams.map((exam) => (
//             <div key={exam} className="mb-2">
//               <label className="inline-block w-32">{exam} Rank:</label>
//               <input
//                 type="number"
//                 value={filter.ranks[exam] ?? ''}
//                 onChange={(e) => {
//                   const value = parseInt(e.target.value) || 0;
//                   console.log(`Rank input for ${exam} changed to:`, value);
//                   setFilter((prev) => ({
//                     ...prev,
//                     ranks: { ...prev.ranks, [exam]: value },
//                   }));
//                 }}
//                 className="p-2 border rounded w-32"
//                 placeholder="Enter rank"
//                 min="0"
//               />
//             </div>
//           ))}
//         </div>
//         <div className="mb-4">
//           <label className="block mb-2 font-medium">Placement Filters (LPA):</label>
//           <div className="flex gap-4">
//             <div>
//               <label className="block mb-1">Min Average:</label>
//               <input
//                 type="number"
//                 value={filter.min_average_placement ?? ''}
//                 onChange={(e) => {
//                   const value = parseInt(e.target.value) || undefined;
//                   setFilter((prev) => ({ ...prev, min_average_placement: value }));
//                 }}
//                 className="p-2 border rounded w-32"
//                 placeholder="e.g., 10"
//                 min="0"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">Min Median:</label>
//               <input
//                 type="number"
//                 value={filter.min_median_placement ?? ''}
//                 onChange={(e) => {
//                   const value = parseInt(e.target.value) || undefined;
//                   setFilter((prev) => ({ ...prev, min_median_placement: value }));
//                 }}
//                 className="p-2 border rounded w-32"
//                 placeholder="e.g., 10"
//                 min="0"
//               />
//             </div>
//             <div>
//               <label className="block mb-1">Min Highest:</label>
//               <input
//                 type="number"
//                 value={filter.min_highest_placement ?? ''}
//                 onChange={(e) => {
//                   const value = parseInt(e.target.value) || undefined;
//                   setFilter((prev) => ({ ...prev, min_highest_placement: value }));
//                 }}
//                 className="p-2 border rounded w-32"
//                 placeholder="e.g., 20"
//                 min="0"
//               />
//             </div>
//           </div>
//         </div>
//         <button
//           onClick={handleFilter}
//           className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
//           disabled={!filter.exams.length || !Object.values(filter.ranks).some((r) => r > 0)}
//         >
//           Apply Filter
//         </button>
//       </div>
//       <div className="mb-4">
//         <label className="block mb-2 font-medium">Sort By:</label>
//         <select
//           value={filter.sort_by}
//           onChange={(e) => {
//             console.log('Sort changed to:', e.target.value);
//             setFilter((prev) => ({ ...prev, sort_by: e.target.value }));
//           }}
//           className="p-2 border rounded"
//         >
//           <option value="cutoff_rank_asc">Cutoff Rank (Low to High)</option>
//           <option value="cutoff_rank_desc">Cutoff Rank (High to Low)</option>
//           <option value="average_placement_desc">Average Placement (High to Low)</option>
//           <option value="median_placement_desc">Median Placement (High to Low)</option>
//           <option value="highest_placement_desc">Highest Placement (High to Low)</option>
//         </select>
//       </div>
//       {error && <div className="text-red-500 mb-4">{error}</div>}
//       {colleges.length > 0 ? (
//         <div className="grid gap-4">
//           {colleges.map((college, index) => (
//             <div key={index} className="p-4 border rounded-lg">
//               <h2 className="text-lg font-bold">{college.college} - {college.branch}</h2>
//               <p>Exam: {college.exam}</p>
//               <p>Cutoff Rank: {college.cutoff_rank}</p>
//               <p>Average Placement: {college.average_placement ? `${college.average_placement} LPA` : 'N/A'}</p>
//               <p>Median Placement: {college.median_placement ? `${college.median_placement} LPA` : 'N/A'}</p>
//               <p>Highest Placement: {college.highest_placement ? `${college.highest_placement} LPA` : 'N/A'}</p>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="text-gray-500">No colleges found.</p>
//       )}
//       {!showAll && colleges.length === 10 && (
//         <button
//           onClick={handleShowMore}
//           className="mt-4 p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
//         >
//           Show More
//         </button>
//       )}
//     </div>
//   );
// }