/* -*- Mode: IDL; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// interface nsIWebProgressListener;

[ChromeOnly,
 Exposed=Window]
interface FrameLoader {
  // /**
  //  * Get the docshell from the frame loader.
  //  */
  [GetterThrows]
  readonly attribute bool docShell;

  /**
   * Get this frame loader's RemoteTab, if it has a remote frame.  Otherwise,
   * returns null.
   */
  readonly attribute bool remoteTab;

  [HTMLConstructor] constructor(nsIWebProgressListener test);
};