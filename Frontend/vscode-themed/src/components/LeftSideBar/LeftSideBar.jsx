import React, { useContext } from "react";
import "./LeftSideBar.css";
import { VscFiles } from "react-icons/vsc";
import { RiCodeSSlashFill } from "react-icons/ri";
import { MdOutlineMailOutline } from "react-icons/md";
import { BiBriefcase } from "react-icons/bi";
import { GrContactInfo } from "react-icons/gr";
import { FaGithub } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { AppContext } from "../../context/AppContext";

function LeftSideBar() {
  const { activeFile, setActiveFile } = useContext(AppContext);

  const iconBorder = (value) => {
    setActiveFile(value);
  };

  return (
    <div className="leftSideBar">
      <div className="leftSideTop">
        <div
          className={`icon-div ${activeFile === 1 ? "selected" : ""}`}
          onClick={() => iconBorder(1)}
        >
          <VscFiles color="white" className="icons" title="Home" />
        </div>
        <div
          className={`icon-div ${activeFile === 2 ? "selected" : ""}`}
          onClick={() => iconBorder(2)}
        >
          <GrContactInfo color="white" className="icons" title="About me" />
        </div>
        <div
          className={`icon-div ${activeFile === 3 ? "selected" : ""}`}
          onClick={() => iconBorder(3)}
        >
          <BiBriefcase color="white" className="icons" title="Experience" />
        </div>
        <div
          className={`icon-div ${activeFile === 4 ? "selected" : ""}`}
          onClick={() => iconBorder(4)}
        >
          <RiCodeSSlashFill color="white" className="icons" title="Projects" />
        </div>
        <div
          className={`icon-div ${activeFile === 5 ? "selected" : ""}`}
          onClick={() => iconBorder(5)}
        >
          <MdOutlineMailOutline
            color="white"
            className="icons"
            title="Contact me"
          />
        </div>
      </div>
      <div className="leftSideBottom">
        <div
          className={`icon-div ${activeFile === 6 ? "selected" : ""}`}
          onClick={() => iconBorder(6)}
        >
          <FaLinkedinIn color="white" className="icons" title="LinkedIn" />
        </div>
        <div
          className={`icon-div ${activeFile === 7 ? "selected" : ""}`}
          onClick={() => iconBorder(7)}
        >
          <FaGithub color="white" className="icons" title="GitHub" />
        </div>
      </div>
    </div>
  );
}

export default LeftSideBar;
