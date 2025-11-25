import React, { use, useState } from "react";
import { useEffect } from "react";
import {createReport,getDues} from '../../api/dueReport.js';
import { confirm, success, error as swalError } from '../../utils/swal';
const DueReportCard = () => {
  const [dues,setDues]=useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');  
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    loadDues();
  }, []);

  useEffect(() => {   
    const filtered = dues.filter((student) => student.grade === selectedGrade && student.class === selectedClass);
    setFilteredStudents(filtered);    
  }, [selectedGrade, selectedClass, dues]);

const loadDues=async() => {
  const responce=await getDues();
  setDues(responce.data);
  console.log(dues);
  
} 
const grades=['1','2','3','4','5','6','7','8','9','10','11','A/L'];

const getClassOptions = (grade) => {
    if (grade === 'A/L') {
      return ['2025', '2026', '2027', '2028', '2029', '2030', '12X', '13X'];
    } else {
      const gradeNum = parseInt(grade);
      return [
        `${gradeNum}s1`, `${gradeNum}s2`, `${gradeNum}s3`, `${gradeNum}s4`, `${gradeNum}s5`, `${gradeNum}s6`,
        `${gradeNum}T`, `${gradeNum}X`
      ];
    }
  };
/**
 * Handles the generation of a due report based on the current class and grade state.
 * Currently just displays an error message, but should be replaced with actual logic to generate a due report.
 * @returns {Promise<void>} Resolves with no value when the generation is complete.
 */
  const handleGenerate = async () => {
    // Replace with your actual generate logic (API call, navigation, etc.)
    try {
      await createReport({ class: klass, grade: grade });
    } catch (error) {}
    swalError('Due Report generation is not implemented yet.');
  };

  return (
   <div className="h-full w-full overflow-x-auto p-4">
      <div className="mx-auto max-w-full rounded-xl bg-slate-800 p-8 text-white shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-semibold">Due payment Records</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Grade</label>
           {/* <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Grades</option>
              {grade.map((g) => (
                <option key={g} value={g}>
                  {g === 'A/L' ? 'A/L' : `Grade ${g}`}
                </option>
              ))}
            </select>*/}
          </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Grades</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade === 'A/L' ? 'A/L' : `Grade ${grade}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-slate-700 p-2.5 text-white focus:border-blue-500 focus:ring-blue-500"
              disabled={!selectedGrade}
            >
              <option value="">All Classes</option>
              {selectedGrade && getClassOptions(selectedGrade).map((classOption) => (
                <option key={classOption} value={classOption}>
                  {classOption}
                </option>
              ))}
            </select>
          </div>
          </div>

         {/* <div>
            <label className="mb-2 block text-sm font-medium text-white">Search by Admission No</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Admission No"
              value={searchAdmission}
              onChange={(e) => setSearchAdmission(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Search by Name</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 bg-slate-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Student Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>*/}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Admission No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">WhatsApp</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Current Grade</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Class</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Due Amount</th>              
            </tr>
          </thead>
          {/*}
          <tbody className="divide-y divide-gray-200 text-sm text-slate-800">
            {dues.map((d) => (
              <tr key={d.id}>
                
                <td className="px-4 py-2">{d.admission_number}</td>
                <td className="px-4 py-2">{d.name}</td>
                <td className="px-4 py-2">{d.whatsapp_number || 'N/A'}</td>               
                <td className="px-4 py-2">{d.current_grade}</td>
                <td className="px-4 py-2">{d.current_class}</td>
                <td className="px-4 py-2">Rs {d.due_amount}</td>               
              </tr>
            ))}
          </tbody>*/}
        </table>
        {/* After the table, add empty state */}
{dues.length === 0 && (
  <div className="text-center py-8 bg-white">
    <p className="text-gray-500 text-lg">No pending dues found</p>
   
  </div>
)}
      </div>      
    </div>
  );
};

export default DueReportCard;
