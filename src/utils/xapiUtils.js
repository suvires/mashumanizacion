export const getStartedCourseStatement = (actor) => {
  const statement = {
    actor,
    verb: {
      id: "https://xapi.easyyeah.com/verbs/started",
      display: {
        "en-GB": "started",
        "es-ES": "empezó",
      },
    },
    object: {
      objectType: "Activity",
      id: "https://xapi.easyyeah.com/activities/course",
      definition: {
        name: {
          "en-US": "+Humanización",
          "es-ES": "+Humanización",
        },
        description: {
          "en-US": "+Humanización course",
          "es-ES": "+Humanización curso",
        },
      },
    },
  };
  return statement;
};

export const getViewedVideoStatement = (actor, video) => {
  const statement = {
    actor,
    verb: {
      id: "https://xapi.easyyeah.com/verbs/viewed",
      display: {
        "en-GB": "viewed",
        "es-ES": "vió",
      },
    },
    object: {
      objectType: "Activity",
      id: "https://xapi.easyyeah.com/activities/video",
      definition: {
        name: {
          "en-US": video,
          "es-ES": video,
        },
        description: {
          "en-US": "Video " + video,
          "es-ES": "Video " + video,
        },
      },
    },
  };
  return statement;
};

export const getRetriedVideoStatement = (actor, video) => {
  const statement = {
    actor,
    verb: {
      id: "https://xapi.easyyeah.com/verbs/retried",
      display: {
        "en-GB": "retried",
        "es-ES": "reintentó",
      },
    },
    object: {
      objectType: "Activity",
      id: "https://xapi.easyyeah.com/activities/video",
      definition: {
        name: {
          "en-US": video,
          "es-ES": video,
        },
        description: {
          "en-US": "Video " + video,
          "es-ES": "Video " + video,
        },
      },
    },
  };
  return statement;
};

export const getViewedVideoSegmentStatement = (actor, video, segment) => {
  const statement = {
    actor,
    verb: {
      id: "https://xapi.easyyeah.com/verbs/viewed",
      display: {
        "en-GB": "viewed",
        "es-ES": "vió",
      },
    },
    object: {
      objectType: "Activity",
      id: "https://xapi.easyyeah.com/activities/video",
      definition: {
        name: {
          "en-US": video,
          "es-ES": video,
        },
        description: {
          "en-US": "Video " + video,
          "es-ES": "Video " + video,
        },
      },
    },
    result: {
      extensions: {
        "https://xapi.easyyeah.com/extension/segment": segment.title,
      },
    },
  };
  return statement;
};

export const getQuittedCourseStatement = (actor, sessionTime) => {
  const statement = {
    actor,
    verb: {
      id: "https://xapi.easyyeah.com/verbs/quitted",
      display: {
        "en-GB": "quitted",
        "es-ES": "salió",
      },
    },
    object: {
      objectType: "Activity",
      id: "https://xapi.easyyeah.com/activities/course",
      definition: {
        name: {
          "en-US": "+Humanización",
          "es-ES": "+Humanización",
        },
        description: {
          "en-US": "Course +Humanización",
          "es-ES": "Curso +Humanización",
        },
      },
    },
    result: {
      extensions: {
        "https://xapi.easyyeah.com/extension/session_time": sessionTime,
      },
    },
  };
  return statement;
};

export const getFinishedCourseStatement = (actor) => {
  const statement = {
    actor,
    verb: {
      id: "https://xapi.easyyeah.com/verbs/completed",
      display: {
        "en-GB": "completed",
        "es-ES": "completó",
      },
    },
    object: {
      objectType: "Activity",
      id: "https://xapi.easyyeah.com/activities/course",
      definition: {
        name: {
          "en-US": "+Humanización",
          "es-ES": "+Humanización",
        },
        description: {
          "en-US": "Course +Humanización",
          "es-ES": "Curso +Humanización",
        },
      },
    },
  };
  return statement;
};
