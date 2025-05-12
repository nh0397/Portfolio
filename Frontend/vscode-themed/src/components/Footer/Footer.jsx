import React from "react";
import "./Footer.css";
import { IoGitBranchOutline, IoWarningOutline } from "react-icons/io5";
import { CgCopyright } from "react-icons/cg";
import { VscError } from "react-icons/vsc";
import { BsCheck2All } from "react-icons/bs";
import { FaBell } from "react-icons/fa";

function Footer({ github }) {
  return (
    <div className="footer-main">
      <div className="footer-left">
        <div className="footer-copyright">
          <CgCopyright className="copyright-icon" />
          <span>2025</span>
        </div>

        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-branch"
        >
          <IoGitBranchOutline className="branch-icon" />
          <span className="branch-name">main <sup>*</sup></span>
        </a>

        <div className="footer-status">
          <VscError className="footer-status-icon" />
          <span>0</span>
        </div>

        <div className="footer-status">
          <IoWarningOutline className="footer-status-icon" />
          <span>0</span>
        </div>
      </div>

      <div className="footer-right">
        <BsCheck2All className="footer-right-icon" />
        <span className="footer-prettier">Prettier</span>
        <FaBell className="footer-right-icon" />
      </div>
    </div>
  );
}

export default Footer;
