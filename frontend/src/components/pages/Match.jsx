import { useState, useEffect } from 'react';
import Profile from '../ui-components/Profile';
import Filter from '../ui-components/Filter';
import backend from '../../backend';
import currentUser from '../../currentUser';

export default function Match() {
    const [filterResults, setFilterResults] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [profileMode, setProfileMode] = useState(0);
  
    useEffect(() => {
        setCurrentIndex(0);
        setFilterResults([]);
    }, []);

    function goToNext(decision) {
        backend.post('/match/matcher', {
            user1Id: currentUser.user_id,
            user2Id: filterResults[currentIndex].user_id,
            decision: decision
        });
        setCurrentIndex(currentIndex+1);
        //setFilterResults(s => s.slice(1));
    }

    if (currentIndex >= filterResults.length) {
        return (
          <div className={"h-full" +
            ""}>
              <Filter setFilterResults={setFilterResults} />
            <div className={"flex h-full justify-center items-center"}>
                <p className={"text-center"}>Out of results, please change your filters!</p>
            </div>
          </div>
        )
    }

    return (
      <div>
          <Filter setFilterResults={setFilterResults} />
          <Profile user_data={filterResults[currentIndex]?.user_data} qnaAnswers={filterResults[currentIndex]?.profile_data?.qnaAnswers} editedBio={filterResults[currentIndex]?.profile_data?.bio} editable={false} dormMode={profileMode}/>
          <div className="absolute bottom-[3vh] justify-around left-1/2 transform -translate-x-1/2 space-x-5">
              <button onClick={() => goToNext("reject")}
                      className="w-[8vh] h-[8vh] bg-maroon_new rounded-full text-center align-middle text-white font-bold hover:bg-red-600 shadow-md">
                  <p className={"text-gold"}>X</p>
              </button>
              <button onClick={() => goToNext("unsure")}
                       className="w-[8vh] h-[8vh] bg-offwhite border-black border-[1px] rounded-full text-center align-middle text-white font-bold hover:bg-slate-300 shadow-md">💾</button>
              <button onClick={() => goToNext("match")}
                      className="w-[8vh] h-[8vh] bg-gold rounded-full text-center align-middle text-white font-bold hover:bg-green-600 shadow-md">
                  <p className={"text-maroon_new"}>&#10003;</p>
              </button>
          </div>

          <div className="absolute bottom-[3vh] ml-[70vw] space-x-[1vw] text-[1vw]">
            <button onClick={() => setProfileMode(0)}
                className="w-[8vh] h-[8vh] bg-maroon_new rounded-full text-center align-middle text-white font-bold hover:bg-red-600 shadow-md">Dorm</button>
            <button onClick={() => setProfileMode(2)}
                className="w-[8vh] h-[8vh] bg-offwhite border-black border-[1px] rounded-full text-center align-middle text-black font-bold hover:bg-slate-300 shadow-md">Both</button>
            <button onClick={() => setProfileMode(1)}
                className="w-[8vh] h-[8vh] bg-gold rounded-full text-center align-middle text-white font-bold hover:bg-green-600 shadow-md">Apt.</button>
        </div>
      </div>
    );
}
