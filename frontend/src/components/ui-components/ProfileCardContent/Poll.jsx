import React, { useState, useEffect, useRef } from 'react';
import backend from "../../../backend";
import whiteX from "../../../assets/images/whiteX.svg";

export default function Poll({answersRevealed, user_id, broadcaster}) {
  const defaultPollData = {
    question: "Question Here",
    answers: [
      { answer: "Option A", votes: 0 },
      { answer: "Option B", votes: 0 },
      { answer: "Option C", votes: 0 },
      { answer: "Option D", votes: 0 },
    ],
  };

  const [pollData, setPollData] = useState(defaultPollData);
  const [answerRevealed, setAnswerRevealed] = useState(answersRevealed);
  const [resetVotes, setResetVotes] = useState(false);
  const [voteTotal, setVoteTotal] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const pollQs = await backend.get('/profile/poll-questions', {
          params: {
            user_id: user_id
          }
        });

        if (pollQs.data && pollQs.data[0]?.question_text != null) {
            const answers = [
              {
                answer: pollQs.data[0]?.option_text_1,
                votes: pollQs.data[0]?.option_votes_1
              },
              {
                answer: pollQs.data[0]?.option_text_2,
                votes: pollQs.data[0]?.option_votes_2
              },
              {
                answer: pollQs.data[0]?.option_text_3,
                votes: pollQs.data[0]?.option_votes_3
              },
              {
                answer: pollQs.data[0]?.option_text_4,
                votes: pollQs.data[0]?.option_votes_4
              }
            ].filter(option => option.answer !== 'N/A');
          
            setPollData({
              question: pollQs.data[0]?.question_text,
              answers: answers
            });
          }
          
      } catch (error) {
        console.error('Error fetching poll data:', error);
      }
    }

    fetchData();
    setAnswerRevealed(answersRevealed);
  }, [user_id]);

  async function vote(numb) {
    console.log(user_id);
    try {
      await backend.put('/profile/poll-question-vote', {
        user_id: user_id,
        voteSlot: numb
      });
        
    } catch (error) {
      console.error('Error voting:', error);
    }
  }
  
  function displayResults(index){
    const updatedAnswers = pollData.answers.map((option, i) => 
        i === index ? { ...option, votes: option.votes + 1 } : option
    );

    setPollData(prevData => ({
        ...prevData,
        answers: updatedAnswers
    }));

    vote(index+1)
    setVoteTotal(prevTotal => prevTotal+1);
    console.log(voteTotal);
    setAnswerRevealed(prev => !prev);
  }

  const changeAnswer = (answerIndex, newAnswerText) => {
    setPollData(prevPollData => ({
      ...prevPollData,
      answers: prevPollData.answers.map((answer, index) => 
        index === answerIndex 
          ? { ...answer, answer: newAnswerText }
          : answer
      )
    }));
  };

  const changeQuestion = (newQuestion) => {
    setPollData(prevPollData => ({
      ...prevPollData,
      question: newQuestion 
    }));
  };

  const removeAnswer = (answerIndex) => {
    setPollData(prevPollData => ({
      ...prevPollData,
      answers: prevPollData.answers.filter((_, index) => index !== answerIndex)
    }));
  };

  const addAnswer = () => {
    const newAnswer = { answer: "New Option", votes: 0 };
    setPollData(prevPollData => ({
      ...prevPollData,
      answers: [...prevPollData.answers, newAnswer]
    }));
  };

  useEffect(() => {
    if (broadcaster) {
      const cb = () => {
        backend.put('/profile/poll-question', {
          user_id: user_id,
          question_text: pollData.question,
          option_text_1: pollData.answers[0]?.answer || "N/A",
          option_text_2: pollData.answers[1]?.answer || "N/A",
          option_text_3: pollData.answers[2]?.answer || "N/A",
          option_text_4: pollData.answers[3]?.answer || "N/A"
        }).then(() => {
          if (resetVotes) {
            return backend.put('/profile/poll-vote-wipe', {
              user_id: user_id
            });
          }
        }).catch(error => {
          console.error("Error updating poll question or wiping votes:", error);
        });
      };

      broadcaster.connect(cb)
      return () => broadcaster.disconnect(cb)
    }

    let totalVotes = 0;
    for (let i = 0; i < pollData.answers.length; i++) {
      totalVotes += pollData.answers[i].votes;
    }
    setVoteTotal(totalVotes);

}, [broadcaster, pollData, resetVotes])

const livingRef = useRef(null);

const resizeFont = () => {
  if (livingRef.current) {
      const parentHeight = livingRef.current.clientHeight;
      const fontSize = parentHeight * 0.63; // Adjust this multiplier as needed
      livingRef.current.style.fontSize = `${fontSize}px`;
  }
};

useEffect(() => {
    /* const observer = new ResizeObserver(resizeFont);
    if (livingRef.current) {
        observer.observe(livingRef.current);
    } 

    resizeFont(); // Ensure the font size is set correctly on mount or when the page is revisited

    return () => {
        observer.disconnect(); // Clean up the observer on unmount
    }; */
}, []);

  return (
    <div className={"w-full h-full rounded-lg border-solid border-2 border-maroon xl:text-lg lg: text-md md:text-sm sm:text-xs font-roboto_slab font-medium"}>
      <div className={"flex w-full h-full flex-col"}>
        {/*Top headers*/}
        <p className={"flex justify-center w-full"}>
          <span className={"text-center"} ref={livingRef}>
            {broadcaster ? 
              <input
                id="Question"
                className="text-center rounded-lg xl:text-md lg: text-sm md:text-xs sm:text-[0.4rem] mb-[1vh] mt-[1vh] bg-gray text-maroon"
                value={pollData.question}
                onChange={(e) => changeQuestion(e.target.value)}
              /> 
            : pollData.question}
          </span>
        </p>
        <div className={"flex h-0 w-[100%] border-solid border-b-[1px] border-maroon"}></div>

        {/*Bottom panel with tags*/}
        <div className={"flex w-full p-2 max-h-[80%] grow-[0] flex-col gap-1 overflow-y-scroll"} style={{
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none',

          '&::-webkit-scrollbar': {
            width: '0'
          }
        }}>
          {answerRevealed ? 
            <>
            {pollData.answers.map((newAnswer, index) => (
              <p key={index} className={"flex justify-center w-full mt-[1vh]"}>
                <div className={"rounded-lg w-[97%] h-[3vh] relative border-maroon xl:text-md lg: text-sm md:text-xs sm:text-[0.4rem] text-white bg-maroon"}>
                  {!broadcaster && <div style={{ width: `${voteTotal > 0 ? (pollData.answers[index].votes / voteTotal * 100) : 0}%` }} className={`bg-dark_maroon rounded-lg flex h-[100%]`}/>}
                  <div className={"absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"}>
                    {broadcaster ? 
                      <input
                        id={"Answer" + index}
                        className="text-center rounded-lg bg-dark_maroon text-white"
                        value={newAnswer.answer}
                        onChange={(e) => changeAnswer(index, e.target.value)}
                      /> 
                      : newAnswer.answer}
                  </div>
                  <div className={"absolute left-[92.5%] top-[50%] translate-x-[-50%] translate-y-[-50%]"}>
                    {broadcaster ? 
                      <>
                        {pollData.answers.length > 2 && <button onClick={() => removeAnswer(index)}>
                          <img src={whiteX} className={"mt-[1vh] w-3 h-3"}/>
                        </button> } 
                      </>
                      : 
                      <>
                      {voteTotal > 0 ? `${(newAnswer.votes / voteTotal * 100).toFixed(1)}%` : "0%"}
                      </>
                    }
                  </div>
                </div>
              </p>
            ))}
              {(broadcaster && pollData.answers.length < 4) && (
                <div className="flex justify-center w-full mt-[1vh]">
                  <button onClick={addAnswer}>
                    ➕
                  </button>
                </div>
              )}
              {broadcaster && 
                <div className="flex justify-center w-full mt-[1vh]">
                  <button className={"rounded-lg w-[97%] h-[3vh] relative xl:text-md lg: text-sm md:text-xs sm:text-[0.4rem] text-black bg-gold"} onClick={() => setResetVotes(prevState => !prevState)}>
                    Reset Votes
                    {resetVotes && <div className={"absolute left-[92.5%] top-[50%] translate-x-[-50%] translate-y-[-50%]"}>
                    ✅
                    </div>}
                  </button>
                </div>
              }
          </>
          :
            pollData.answers.map((newAnswer, index) => (
              <p key={index} className={"flex justify-center w-full mt-[1vh]"}>
                <button className={"rounded-lg w-[97%] h-[3vh] flex items-center justify-center border-solid border-2 border-maroon xl:text-md lg: text-sm md:text-xs sm:text-[0.4rem] text-white bg-maroon"} onClick={() => displayResults(index)}>
                  {newAnswer.answer}
                </button>
              </p>
            ))
          }
        </div>
      </div>
    </div>
  );
}   