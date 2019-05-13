import { useEffect } from "react";
import { useLocation } from "./index.js";

const Redirect = props => {
  const [, push] = useLocation();
  useEffect(() => push(props.href || props.to));

  return null;
};

export default Redirect;
