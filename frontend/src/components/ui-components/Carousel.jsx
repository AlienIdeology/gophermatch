import React, { useState, useEffect } from 'react';
import styles from '../../assets/css/carousel.module.css'
import { useNavigate } from 'react-router-dom'

export default function Carousel(props) {
    const [position, setPosition] = React.useState(0)
    const [isHovering, setIsHovering] = useState(false);
    const navigate = useNavigate();
    const editable = props.editable;

    function shiftPosition(n) {

    }

    const currentImage = props.pictures[position];
    const carouselLen = props.pictures.length

    function showOverlay(){
        if(editable){
            setIsHovering(prev => !prev);
        }
    }

    function gotoUpload(){
        if(editable){
            navigate("/inbox");
        }
    }

    let dots = props.pictures.map((pic, i) => {
        if (i == position) { // the key is weird, will need to change if issues
            return <button key={pic + i} className={styles.dotSolid}></button>
        } else {
            return <button key={pic + i} className={styles.dotEmpty} onClick={() => setPosition(i)}></button>
        }
    })

    const dotSection = (
        <div className={styles.dotSection}>
            <button className={styles.progressButton} onClick={() => setPosition((position - 1 + carouselLen) % carouselLen)}>
                &lt;
            </button>
            <div className={styles.dots}>{dots}</div>
            <button className={styles.progressButton} onClick={() => setPosition((position + 1) % carouselLen)}>
                &gt;
            </button>
        </div>
    )

    return (
        <div className={styles.container}>
            <div class ="flex justify-center items-center">
                {isHovering && <img src='../../assets/images/imageicon.png' class="absolute scale-[0.15]"/>}
                <div id="imageWrapper" className = {"hover:bg-gray-900 hover:opacity-80 hover:blur-sm hover:h-full"}>
                    <img src={currentImage} className = {"rounded-2xl"} onClick={gotoUpload} onMouseEnter={showOverlay} onMouseLeave={showOverlay}/>
                </div>
            </div>
            {carouselLen > 1 && dotSection}
        </div>
    )
}