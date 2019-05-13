import { useState } from "react";

export const memoryLocation = (path = "/") => () => useState(path);
