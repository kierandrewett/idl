/* -*- Mode: IDL; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

#include "nsISupports.idl"

%{C++
#include "nsLiteralString.h"
%}

interface nsIWebProgressListener;

[ChromeOnly,
 Exposed=Window]
interface FrameLoader : nsISupports, nsIObserver {
  /**
   * Get the docshell from the frame loader.
   */
  [GetterThrows]
  readonly attribute nsIWebProgressListener docShell;

  /**
   * Values describing the basic preference types.
   *
   * @see getPrefType
   */
  const unsigned long PREF_INVALID = 0;
  const unsigned long PREF_STRING = 32;
  const long PREF_INT = 64;
  const long PREF_BOOL = 128;

  // /**
  //  * Get this frame loader's RemoteTab, if it has a remote frame.  Otherwise,
  //  * returns null.
  //  */
  readonly attribute bool remoteTab;

  [HTMLConstructor] constructor(nsIWebProgressListener test, bool test);

  void loadURI(in const unsigned long PREF_INVALID);

  boolean prefIsSanitized(in string aPrefName, out auto aResult);

  [binaryname(AddObserverImpl)]
  void addObserver(in ACString aDomain, in nsIObserver aObserver,
                   [optional] in boolean aHoldWeak);
};