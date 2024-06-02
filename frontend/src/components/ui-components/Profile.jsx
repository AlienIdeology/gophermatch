import React, { useEffect, useState } from "react";
import Carousel from './Carousel';
import styles from '../../assets/css/profile.module.css';
import kanye from '../../assets/images/kanye.png';
import other from '../../assets/images/testprofile.png';
import TopFive from "./TopFive.jsx";
import qnaData from "./qnaOptions.json";
import currentUser from "../../currentUser.js";
import backend from "../../backend.js";
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import BioBox from './BioBox.jsx';
import sliderStyles from '../../assets/css/slider.module.css';

export default function Profile({ user_data, editable, handleBioChange, handleQnaChange, qnaAnswers, editedBio, apartmentData, dormMode, top5, setTop5, top5Question, setTop5Question }) {

  const [pictureUrls, setPictureUrls] = useState(["", "", ""]);
  const [sliderValue, setSliderValue] = useState({ min: 80, max: 144 });
  const [editedBio, setEditedBio] = useState(editedBio);

  const formatTime = (value) => {
    const hours = Math.floor(value / 4);
    const minutes = (value % 4) * 15;
    const ampm = hours < 12 ? "am" : "pm";
    const formattedHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

    if (value === 144) {
      return `12pm+`;
    }

    if (hours >= 24) {
      if (hours === 24) {
        return `12:${minutes === 0 ? "00" : minutes}am`;
      }
      return `${hours - 24}:${minutes === 0 ? "00" : minutes}am`;
    }

    return `${formattedHours}:${minutes === 0 ? "00" : minutes}${ampm}`;
  };

  useEffect(() => {
    fetchPictureUrls();
  }, [user_data]);

  const fetchPictureUrls = async () => {
    try {
      const response = await backend.get("/profile/user-pictures", {
        params: { user_id: user_data.user_id },
        withCredentials: true,
      });
      if (response) {
        const data = response.data;
        setPictureUrls(data.pictureUrls);
      } else {
        throw new Error("Failed to fetch picture URLs");
      }
    } catch (error) {
      console.error("Error fetching picture URLs:", error);
    }
  };

  const getSelectedOptionId = (questionId) => {
    const monthNumbers = {};
    for (let i = 1; i <= 12; i++) {
      const monthNumber = i.toString().padStart(2, '0');
      const monthIndex = 96 + i - 1;
      monthNumbers[monthNumber] = monthIndex;
    }

    if (questionId === 14) {
      const moveIn = apartmentData ? apartmentData.move_in_date : null;
      if (moveIn != null && !editable) {
        return apartmentData ? monthNumbers[moveIn.slice(5, 7)] : null;
      }
    } else if (questionId === 15) {
      const moveOut = apartmentData ? apartmentData.move_out_date : null;
      if (moveOut != null && !editable) {
        return apartmentData ? monthNumbers[moveOut.slice(5, 7)] + 12 : null;
      }
    }

    if (Array.isArray(qnaAnswers)) {
      const answer = qnaAnswers.find(ans => ans.question_id === questionId);
      return answer ? answer.option_id : null;
    }
    return null;
  };

  const getSelectedTextField = (questionId) => {
    if (questionId === 16) {
      return apartmentData ? apartmentData.rent : null;
    }
    return null;
  };

  const handleTextChange = (event, questionId) => {
    // Implement the function to handle text input change
  };

  const qnaItems = qnaData.map((item, index) => (
    <div key={item.id} className={`flex w-full pl-[0.75vw] pr-[1vw] border-b ${index !== qnaData.length - 1 ? 'mb-[0.1vh]' : ''} ${index === 0 ? 'mt-[0.25vh]' : ''} ${index === 3 ? 'mt-[0.25vh]' : ''} ${index === 6 ? 'border-b-0' : ''} ${index === 2 ? 'border-b-0' : ''}`} style={{ minHeight: '1vh' }}>
      <p className="flex-[1vh] flex items-center" style={{ lineHeight: '1.875' }}>{item.question}</p>
      {editable && item.isTextField ? (
        <input
          type="text"
          className="text-right"
          onChange={(event) => handleTextChange(event, item.id)}
        />
      ) : null}
      {editable && !item.isTextField ? (
        <select
          className={"text-right"}
          value={getSelectedOptionId(item.id) || ''}
          onChange={(event) => handleQnaChange(event, item.id)}
        >
          {item.options.map((option) => (
            <option key={option.option_id} value={option.option_id}>
              {option.text}
            </option>
          ))}
        </select>
      ) : (null)}
      {(!editable && !item.isTextField) && <p className="truncate whitespace-nowrap mt-[0.4vh]">
        {item.options.find(o => o.option_id === getSelectedOptionId(item.id))?.text || 'N/A'}
      </p>}
      {(!editable && item.isTextField) && <p className="truncate whitespace-nowrap">
        {getSelectedTextField(item.id)}
      </p>}
    </div>
  ));

  return (
    <>
      <div className={`m-auto w-[65vw] h-screen flex items-center justify-center font-profile font-bold text-maroon_new`}>
        <div className={"w-full flex flex-col h-[70vh] mb-[4vh] bg-white rounded-3xl overflow-hidden"}>
          <div className={"flex h-[35vh]"}>
            <div className={"w-[24vw] h-[24vh] bg-white rounded-3xl mt-[4vh] ml-[-1.6vh]"}>
              <Carousel pictureUrls={pictureUrls} editable={editable}></Carousel>
            </div>
            <div className={"flex-grow flex flex-col bg-white"}>
              <div className={"h-[3vh]"}>
                <p className={"text-[1.22vw] ml-[-0.625vw] mt-[3vh] inline-block flex flex-col"}>
                  <span className="font-bold text-[1.7vw]">{user_data?.first_name} {user_data?.last_name}</span>
                  <span>{user_data?.major} Major</span>
                </p>
              </div>
              <div className={"flex-grow rounded-2xl w-[40.5vw] ml-[-0.5vw] mt-[9vh] mb-[1.5vh] border-2 border-maroon_new overflow"}>
                <p className={"w-full h-full"}>
                  {editable ? (
                    <textarea
                      className={`${styles.bioTextArea} ${editable ? 'w-full h-full' : ''}`}
                      value={editedBio || ''}
                      onChange={handleBioChange}
                      placeholder="Edit Bio"
                    />
                  ) : (
                    <p className={`${styles.bioTextArea}`}>{editedBio}</p>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className={`${dormMode === 0 ? "block" : "hidden"} flex flex-grow`}>
            <div className={"flex-1 flex-col h-[16.5vh] m-[3%] mt-[6vh] ml-[2vw] mb-[0%] rounded-3xl border-2 border-maroon_new overflow-hidden text-[2vh]"}>
              {qnaItems.slice(0, 1)}
              {qnaItems.slice(4, 7)}
            </div>
            <div className={"flex-1 flex-col flex h-[16.5vh] mt-[6vh] mr-[3vw] ml-0 mb-0 rounded-3xl border-2 overflow-hidden text-[2vh]"}>
              <div className="flex flex-row mt-[0.5vh]">
                <span className="ml-[0.75vw]">Gender:</span>
                <span className="flex items-end ml-auto mr-[0.75vw]">{user_data?.gender.charAt(0).toUpperCase() + user_data?.gender.slice(1)}</span>
              </div>
              <div className="bg-maroon h-[0.125vh] w-full mt-[0.25vh]"></div>
              <div className="flex flex-row mt-[0.5vh]">
                <span className="ml-[0.75vw]">College:</span>
                <span className="flex items-end ml-auto mr-[0.75vw]">{['carlson', 'nursing', 'design'].includes(user_data?.college?.toLowerCase()) ? user_data?.college?.charAt(0).toUpperCase() + user_data?.college?.slice(1) : user_data?.college?.toUpperCase()}</span>
              </div>
              <div className="bg-maroon h-[0.125vh] w-full mt-[0.25vh]"></div>
              <div className="flex flex-row mt-[0.5vh]">
                <span className="ml-[0.75vw]">Year:</span>
                <span className="flex items-end ml-auto mr-[0.75vw]">{user_data?.year}</span>
              </div>
            </div>
          </div>
          <div className={`${dormMode === 1 ? "block" : "hidden"} flex flex-grow`}>
            <div className={"flex-1 flex-col h-[16.5vh] m-[3%] mt-[6vh] ml-[2vw] mb-[0%] rounded-3xl border-2 border-maroon_new overflow-hidden text-[2vh]"}>
              {qnaItems.slice(0, 1)}
              {qnaItems.slice(1, 4)}
            </div>
            <div className={"flex-1 flex-col flex h-[16.5vh] mt-[6vh] mr-[3vw] ml-0 mb-0 rounded-3xl border-2 overflow-hidden text-[2vh]"}>
              <div className="flex flex-row mt-[0.5vh]">
                <span className="ml-[0.75vw]">Gender:</span>
                <span className="flex items-end ml-auto mr-[0.75vw]">{user_data?.gender.charAt(0).toUpperCase() + user_data?.gender.slice(1)}</span>
              </div>
              <div className="bg-maroon h-[0.125vh] w-full mt-[0.25vh]"></div>
              <div className="flex flex-row mt-[0.5vh]">
                <span className="ml-[0.75vw]">College:</span>
                <span className="flex items-end ml-auto mr-[0.75vw]">{['carlson', 'nursing', 'design'].includes(user_data?.college?.toLowerCase()) ? user_data?.college?.charAt(0).toUpperCase() + user_data?.college?.slice(1) : user_data?.college?.toUpperCase()}</span>
              </div>
              <div className="bg-maroon h-[0.125vh] w-full mt-[0.25vh]"></div>
              <div className="flex flex-row mt-[0.5vh]">
                <span className="ml-[0.75vw]">Year:</span>
                <span className="flex items-end ml-auto mr-[0.75vw]">{user_data?.year}</span>
              </div>
            </div>
          </div>
          <div className={"flex-1 flex-col flex flex-grow h-[1vh] w-full"}>
            <div className="flex items-center justify-center bg-maroon h-[0.3vh] w-[25vh] rounded-[1vh] mt-[2vh] mb-[0.5vh]"></div>
            <TopFive
              editable={editable}
              top5={top5}
              setTop5={setTop5}
              question={top5Question}
              setQuestion={setTop5Question}
            />
          </div>
          <div className={"flex-1 flex-col flex flex-grow flex items-center justify-center"}>
            <InputRange
              maxValue={144}
              minValue={80}
              step={1}
              value={sliderValue}
              formatLabel={value => formatTime(value)}
              onChange={value => setSliderValue(value)}
              classNames={{
                inputRange: sliderStyles['inputRange'],
                track: sliderStyles['track'],
                activeTrack: sliderStyles['activeTrack'],
                thumb: sliderStyles['thumb'],
                disabledInputRange: sliderStyles['disabledInputRange'],
                valueLabel: sliderStyles['valueLabel']
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}