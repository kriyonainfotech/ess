// import { useState } from "react";
// import AdminSidebar from '../admincomponents/AdminSidebar';
// import AdminHeader from '../admincomponents/AdminHeader';

// const questionsList = [
//   "Is the documentation complete?",
//   "Are there any security concerns?",
//   "Does the UI follow brand guidelines?",
//   "Are all functionalities working as expected?",
//   "Is the response time optimal?",
//   "Are there any accessibility issues?",
//   "Does it work across all browsers?",
//   "Is the codebase maintainable?",
//   "Are error messages clear and helpful?",
//   "Is there any redundant code?",
// ];

// const RemarkPage = () => {
//   const [checkedQuestions, setCheckedQuestions] = useState([]);

//   const handleCheck = (question) => {
//     setCheckedQuestions((prev) =>
//       prev.includes(question)
//         ? prev.filter((q) => q !== question)
//         : [...prev, question]
//     );
//   };

//   const sortedQuestions = [
//     ...questionsList.filter((q) => !checkedQuestions.includes(q)),
//     ...checkedQuestions,
//   ];

//   return (
//     <div className="container-fluid mt-40">
//       <AdminHeader />
//       <div className="d-flex">
//         <AdminSidebar />
//         <div className="container mt-4 p-4 bg-white shadow rounded" style={{ maxWidth: "900px" }}>
//           <h2 className="text-center mb-4">Review Checklist</h2>
//           <ul className="list-group">
//             {sortedQuestions.map((question, index) => (
//               <li
//                 key={index}
//                 className={`list-group-item d-flex justify-content-between align-items-center ${checkedQuestions.includes(question) ? "bg-light text-muted" : ""}`}
//               >
//                 <span>{question}</span>
//                 <input
//                   type="checkbox"
//                   checked={checkedQuestions.includes(question)}
//                   onChange={() => handleCheck(question)}
//                   className="form-check-input"
//                 />
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RemarkPage;
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from '../admincomponents/AdminSidebar';
import AdminHeader from '../admincomponents/AdminHeader';
import { UserContext } from '../UserContext';

const backend_API = import.meta.env.VITE_API_URL;

const RemarkPage = () => {

  const { user } = useContext(UserContext);
  const userId = user._id;
  const [remarks, setRemarks] = useState([]);
  const [questions, setQuestions] = useState([
    { id: 1, text: "Have you completed all required documentation?", checked: false },
    { id: 2, text: "Did you verify the client's identity?", checked: false },
    { id: 3, text: "Is the payment information accurate?", checked: false },
    { id: 4, text: "Have you reviewed the compliance checklist?", checked: false },
    { id: 5, text: "Were all quality assurance checks performed?", checked: false },
    { id: 6, text: "Has the supervisor approval been obtained?", checked: false },
    { id: 7, text: "Did you confirm the delivery address?", checked: false },
    { id: 8, text: "Were safety protocols followed during processing?", checked: false },
    { id: 9, text: "Is the client's data properly secured?", checked: false },
    { id: 10, text: "Have you logged the transaction in the system?", checked: false },
  ]);

  useEffect(() => {
    fetchRemarks();
  }, []);

  const fetchRemarks = async () => {
    try {
      const response = await axios.get(`${backend_API}/remark/user/${userId}`);
      if (response.status === 200) {
        const backendRemarks = response.data.remarks;
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) => {
            const foundRemark = backendRemarks.find((r) => r.question === q.text);
            return foundRemark ? { ...q, checked: foundRemark.checked } : q;
          })
        );
      }
    } catch (error) {
      console.log("Error fetching remarks:", error);
    }
  };

  const handleCheckboxChange = async (questionId) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId ? { ...q, checked: !q.checked } : q
    );
    setQuestions(updatedQuestions);

    try {
      await axios.post(`${backend_API}/save`, {
        userId,
        remarks: updatedQuestions.map((q) => ({ question: q.text, checked: q.checked })),
      });
    } catch (error) {
      console.error("Error saving remarks:", error);
    }
  };

  const checkedCount = questions.filter((q) => q.checked).length;
  const sortedQuestions = [...questions].sort((a, b) => a.checked - b.checked);

  return (
    <div className="container-fluid mt-40">
      <AdminHeader />
      <AdminSidebar />
      <div className="row g-0">
        <div className="p-4 bg-light" style={{ minHeight: "100vh" }}>
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="text-dark mb-0">Remark Checklist</h2>
              <div className="bg-dark text-white p-3 rounded">
                <h5 className="mb-0">
                  Completed: {checkedCount} / {questions.length}
                </h5>
              </div>
            </div>

            <div className="row g-4">
              {sortedQuestions.map((question, index) => (
                <div key={question.id} className="col-12">
                  <div className={`card shadow-sm ${question.checked ? "bg-light" : ""}`}>
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`question-${question.id}`}
                          checked={question.checked}
                          onChange={() => handleCheckboxChange(question.id)}
                          style={{ width: "1.2em", height: "1.2em" }}
                        />
                      </div>
                      <span className={`flex-grow-1 mx-3 ${question.checked ? "text-muted" : ""}`}>
                        {question.text}
                      </span>
                      <span className={`badge ${question.checked ? "bg-success" : "bg-secondary"}`}>
                        {question.checked ? "Completed" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RemarkPage;
